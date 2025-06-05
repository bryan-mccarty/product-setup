import React, { useState } from 'react';
import { MessageSquare, RefreshCw, MessageCircle, DollarSign, BarChart2, ArrowRight, Settings, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const ProjectSetup = () => {
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [selectedInputs, setSelectedInputs] = useState([1, 2, 3, 4, 5, 6]);
  const [selectedOutcomes, setSelectedOutcomes] = useState([1, 2, 3, 4, 5, 6]);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatMessage, setChatMessage] = useState('');




  const navigate = useNavigate();

  const inputs = Array.from({ length: 10 }, (_, i) => i + 1);
  const outcomes = Array.from({ length: 10 }, (_, i) => i + 1);
  const initialProjectLevelConstructs = [
    { id: 1, label: "Constraint - Lemon 0.2%", checked: true },
    { id: 2, label: "Composition - Total Oil", checked: true }
  ];

  const handleProjectTypeSelection = (type) => {
    setSelectedProjectType(type);
    if (type === 'substitute') navigate('/project-setup/substitute');
    if (type === 'preserve-label') navigate('/project-setup/preserve_label');
  };

  const shouldShowInputsAndOutputs = ['optimization', 'cost-reduction', 'match-competitor'].includes(selectedProjectType);

  const [projectLevelConstructs, setProjectLevelConstructs] = useState(initialProjectLevelConstructs);

  // Function to toggle a construct's checkbox
  const toggleProjectLevelConstruct = (id) => {
    setProjectLevelConstructs(prev =>
      prev.map(construct =>
        construct.id === id
          ? { ...construct, checked: !construct.checked }
          : construct
      )
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto pt-6">

      {/* Header with spacing */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product A</h1>
      </div>

      {/* Step 1: Pick Project Type */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-1">Step 1: Pick Project Type</h2>
        <div className="flex gap-4">
          <div 
            className={`border rounded-lg p-6 flex flex-col items-center justify-center w-1/3 aspect-square cursor-pointer ${selectedProjectType === 'optimization' ? 'border-blue-500' : 'border-gray-200'}`} 
            onClick={() => handleProjectTypeSelection('optimization')}
          >
            <div className="bg-black rounded-full p-4 mb-4"><Settings className="w-8 h-8 text-white" /></div>
            <p className="text-center font-semibold">Optimization - Default</p>
          </div>

          <div className="w-2/3 grid grid-cols-2 gap-4">
            {[
              { type: 'substitute', label: 'Substitute Ingredient', icon: RefreshCw },
              { type: 'preserve-label', label: 'Preserve Existing Label', icon: MessageCircle },
              { type: 'cost-reduction', label: 'Cost Reduction', icon: DollarSign },
              { type: 'match-competitor', label: 'Match a Competitor', icon: BarChart2 }
            ].map(({ type, label, icon: Icon }) => (
              <div 
                key={type}
                className={`border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer ${selectedProjectType === type ? 'border-blue-500' : 'border-gray-200'}`} 
                onClick={() => handleProjectTypeSelection(type)}
              >
                <div className="bg-gray-100 rounded-full p-4 mb-2"><Icon className="w-5 h-5 text-gray-600" /></div>
                <p className="text-center font-semibold text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Component */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {!chatExpanded ? (
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Help me setup my project"
                className="flex-1 border-none focus:outline-none text-gray-600"
                onFocus={() => setChatExpanded(true)}
              />
            </div>
            <button className="bg-black text-white rounded-md px-3 py-2" onClick={() => setChatExpanded(true)}>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
                <span className="font-medium">Chat</span>
              </div>
              <button onClick={() => setChatExpanded(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
              {/* Chat messages would go here */}
            </div>
            <div className="flex">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Help me setup my project"
                className="flex-1 border border-gray-300 rounded-l-md p-2 focus:outline-none"
              />
              <button className="bg-black text-white rounded-r-md px-4 py-2">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Select Inputs and Outcomes - Conditional */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-1">Step 2: Select Inputs and Outcomes</h2>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Inputs Column */}
          <div>
            <h3 className="font-semibold mb-2">Inputs</h3>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {inputs.map(id => (
                <div key={id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedInputs.includes(id)}
                    onChange={() =>
                      setSelectedInputs(prev =>
                        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                      )
                    }
                  />
                  <label className="ml-2">Input {id}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Outcomes Column */}
          <div>
            <h3 className="font-semibold mb-2">Outcomes</h3>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {outcomes.map(id => (
                <div key={id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedOutcomes.includes(id)}
                    onChange={() =>
                      setSelectedOutcomes(prev =>
                        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                      )
                    }
                  />
                  <label className="ml-2">Outcome {id}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Project Level Constructs Column */}
          <div>
            <h3 className="font-semibold mb-2">Project Level Constructs</h3>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {projectLevelConstructs.map(({ id, label, checked }) => (
                <div key={id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleProjectLevelConstruct(id)}
                  />
                  <label className="ml-2">{label}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      {selectedProjectType && (
        <div className="flex justify-end mt-4">
          <button 
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold"
            onClick={() => console.log(`Proceeding with project type: ${selectedProjectType}`)}
          >
            Next
          </button>
        </div>
      )}
    </div>





  );
};

export default ProjectSetup;
