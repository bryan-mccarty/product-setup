import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, ReferenceLine, Legend, ResponsiveContainer } from 'recharts';
import { Maximize2, ChevronDown, ChevronUp, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OptimizationDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Sample data for existing formulas
  const existingFormulas = [
    { cost: 130, desirability: 0.85, name: "Formula A" },
    { cost: 220, desirability: 0.88, name: "Formula B" },
    { cost: 380, desirability: 0.76, name: "Formula C" },
    { cost: 520, desirability: 0.57, name: "Formula D" },
    { cost: 650, desirability: 0.28, name: "Formula E" },
    { cost: 780, desirability: 0.39, name: "Formula F" },
    { cost: 950, desirability: 0.19, name: "Formula G" },
  ];

  // Batch data with inputs that sum to 100
  const batchData = [
    {
      id: 1,
      cost: '$180',
      score: 11,
      scoreColor: '#FF4D4D',
      input1: 25,
      input2: 25,
      input3: 25,
      input4: 25,
      outcome1: '0.24-0.64',
      outcome2: '0.23-0.85',
      outcome3: '0.45-0.78',
      desirability: 0.15
    },
    {
      id: 2,
      cost: '$373',
      score: 67,
      scoreColor: '#FFA500',
      input1: 40,
      input2: 30,
      input3: 10,
      input4: 20,
      outcome1: '0.42-0.64',
      outcome2: '0.13-0.82',
      outcome3: '0.21-0.94',
      desirability: 0.65
    },
    {
      id: 3,
      cost: '$498',
      score: 95,
      scoreColor: '#4CAF50',
      input1: 35,
      input2: 25,
      input3: 25,
      input4: 15,
      outcome1: '0.33-0.85',
      outcome2: '0.31-0.88',
      outcome3: '0.28-0.95',
      desirability: 0.82
    }
  ];

  // Probability distribution data
  const distributionData = Array.from({ length: 100 }, (_, i) => {
    const x = i / 100; 
    
    // Create distribution curve
    let y = 0;
    if (x < 0.4) {
      y = 0.1 * Math.exp((x - 0.4) * 8);
    } else {
      y = Math.exp(-Math.pow((x - 0.75), 2) / 0.05);
    }
    
    // Scale to max value of 1.0
    const scaledY = y * 0.9;
    
    return {
      x: x,
      y: scaledY < 0.01 ? 0.01 : scaledY,
      shaded: x > 0.61 ? scaledY : 0
    };
  });

  // Sidebar configuration
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

  // Custom tooltips
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-sm">
          <p className="font-medium">{data.name}</p>
          <p>Cost: ${data.cost}</p>
          <p>Desirability: {data.desirability.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-sm">
          <p>Score: {parseFloat(label).toFixed(2)}</p>
          <p>Probability: {payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with collapse functionality */}
      {sidebarOpen && (
        <div className="w-72 h-full bg-white shadow-md border-r border-gray-300 relative">
          {/* Sidebar toggle button */}
          <button 
            className="absolute -right-3 top-6 bg-white border border-gray-300 rounded-full p-1 shadow-md z-10"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft size={16} />
          </button>
          
          {/* Sidebar content */}
          <div className="w-72 bg-white text-gray-900 p-4 flex flex-col h-full">
            {/* Header Section */}
            <div className="mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-red-600">Low Sugar A</h2>
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
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1">
        <div className="p-4">
          {/* Collapsed sidebar toggle button */}
          {!sidebarOpen && (
            <button 
              className="mb-4 bg-white border border-gray-300 rounded-md p-1 shadow-md"
              onClick={() => setSidebarOpen(true)}
            >
              <ChevronRight size={16} />
            </button>
          )}
          
          {/* Top section with two cards side by side */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Cost vs Desirability Chart */}
            <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-gray-700">Cost vs Desirability</h2>
                <button className="text-gray-500 hover:text-gray-700">
                  <Maximize2 size={18} />
                </button>
              </div>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 10, right: 10, bottom: 40, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="cost" 
                      name="Cost" 
                      domain={[0, 1000]}
                      tickCount={6}
                      label={{ 
                        value: 'Cost ($)', 
                        position: 'insideBottom', 
                        offset: -5,
                        style: { textAnchor: 'middle' }
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="desirability" 
                      name="Desirability" 
                      domain={[0, 1]} 
                      tickCount={5}
                      tickFormatter={value => value.toFixed(1)}
                      label={{ 
                        value: 'Desirability', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' },
                        offset: 5
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomScatterTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                    <Scatter 
                      name="Existing Formulas" 
                      data={existingFormulas} 
                      fill="#1F77B4" 
                      shape="circle"
                      legendType="circle"
                    />
                    <Scatter 
                      name="Trial Formulas" 
                      data={batchData.map(item => ({ 
                        cost: parseInt(item.cost.substring(1)), 
                        desirability: item.desirability,
                        name: `Trial ${item.id}`
                      }))} 
                      fill="#FF7F0E" 
                      shape="diamond"
                      legendType="diamond"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Value of Next Batch */}
            <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-gray-700">Value of Next Batch</h2>
                <button className="text-gray-500 hover:text-gray-700">
                  <Maximize2 size={18} />
                </button>
              </div>
              <div className="mb-4">
                <div className="text-4xl font-bold text-green-500">Turing Score: 65</div>
                <div className="text-sm text-gray-600 mt-2">Probability of Improvement: 30%</div>
                <div className="text-sm text-gray-600">Probability of Meeting Goals: 45%</div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={distributionData}
                    margin={{ top: 5, right: 10, bottom: 40, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="x" 
                      domain={[0, 1]}
                      tickFormatter={value => value.toFixed(1)}
                      label={{ 
                        value: 'Score', 
                        position: 'insideBottom', 
                        offset: -5,
                        style: { textAnchor: 'middle' }
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 1]}
                      tickFormatter={value => value.toFixed(1)}
                      label={{ 
                        value: 'Probability', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' },
                        offset: 5
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <defs>
                      <linearGradient id="colorProbability" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFB6C1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FFB6C1" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="colorShaded" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF5252" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FF5252" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="y" 
                      stroke="#FF5252" 
                      fillOpacity={0.3} 
                      fill="url(#colorProbability)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="shaded" 
                      stroke="none" 
                      fillOpacity={1} 
                      fill="url(#colorShaded)" 
                    />
                    <ReferenceLine 
                      x={0.61} 
                      stroke="#000000" 
                      strokeWidth={2} 
                      strokeDasharray="3 3"
                      label={{ 
                        value: 'Target', 
                        position: 'top', 
                        fill: '#000',
                        fontSize: 12
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Generate Batch Section */}
          <div className="mt-6 mb-3 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Generate Batch</h2>
            <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center">
              <span className="mr-2">+</span>
              <span>Generate Batch</span>
            </button>
          </div>

          {/* Trial Information Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial Information</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input 1</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input 2</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input 3</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input 4</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome 1</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome 2</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome 3</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batchData.map((trial) => (
                    <tr key={trial.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium">Trial {trial.id}</div>
                        <div className="text-sm text-gray-600">Cost: {trial.cost}</div>
                        <div className="text-sm font-medium" style={{ color: trial.scoreColor }}>Score: {trial.score}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{trial.input1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{trial.input2}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{trial.input3}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{trial.input4}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{trial.outcome1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{trial.outcome2}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{trial.outcome3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationDashboard;