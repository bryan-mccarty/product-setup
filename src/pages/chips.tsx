import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const goals = ["Sweetness: Maximize", "Sourness: Minimize", "Thickness: 4", "Cardboard: Minimize", "Saltiness: 4", "Stability: Low", "Shelf Life: Long", "Vinegar flavor: low", "Tanginess: high"];
const totalChips = 36;

export default function ChipAllocator() {
  const [allocations, setAllocations] = useState(Array(goals.length).fill(0));
  const usedChips = allocations.reduce((sum, val) => sum + val, 0);
  const remainingChips = totalChips - usedChips;

  const navigate = useNavigate();

  function handleConfirmClick() {
    navigate("/prioritize-1");
  }

  const getRemainingColor = () => {
    if (remainingChips > totalChips * 0.5) return "text-green-500";
    if (remainingChips > totalChips * 0.2) return "text-yellow-500";
    return "text-red-500";
  };

  const handleAllocationChange = (index, value) => {
    const newAllocations = [...allocations];
    const newTotal = usedChips - newAllocations[index] + value;

    if (newTotal <= totalChips) {
      newAllocations[index] = value;
      setAllocations(newAllocations);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4 bg-white shadow-lg rounded-2xl">
      <h2 className="text-xl font-bold">Allocate Your Chips</h2>
      <p className="text-sm text-gray-600">
        Distribute {totalChips} chips across different priorities. Remaining: 
        <strong className={getRemainingColor()}> {remainingChips}</strong>
      </p>
      
      {goals.map((goal, index) => (
        <Card key={goal} className="p-4">
          <CardContent className="flex flex-col gap-2">
            <div className="flex justify-between text-sm font-medium">
              <span>{goal}</span>
              <span>{allocations[index]} chips</span>
            </div>
            <Slider
              min={0}
              max={totalChips}
              step={1}
              value={[allocations[index]]}
              onValueChange={(value) => handleAllocationChange(index, value[0])}
            />
          </CardContent>
        </Card>
      ))}

      <Button className="w-full mt-4" onClick={handleConfirmClick}>
        Confirm Allocation
      </Button>

    </div>
  );
}
