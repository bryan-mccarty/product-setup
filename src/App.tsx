import { BrowserRouter, Routes, Route } from "react-router-dom";
import OutcomePrioritizationMajor from "./pages/main_flow_major";
import ChipAllocator from "./pages/chips";
import OutcomeRankingIntro from "./pages/instructions";
import OutcomePrioritizationMinor from "./pages/main_flow_minor_new";
import OutcomePrioritizationCost from "./pages/main_flow_cost_new";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OutcomeRankingIntro />} />
        <Route path="/chips" element={<ChipAllocator />} />

        <Route path="/prioritize-1" element={<OutcomePrioritizationMajor />} />
        <Route path="/prioritize-2" element={<OutcomePrioritizationCost />} /> {/* NEW */}
        <Route path="/prioritize-3" element={<OutcomePrioritizationMinor />} /> {/* NEW */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
