import { BrowserRouter, Routes, Route } from "react-router-dom";
import DataProjectsPage from "./pages/landing_page";
import ProjectSetup from "./pages/project_setup";
import IngredientSubstitutionWorkflow from "./pages/ingredient_substitution_workflow"; // NEW PAGE

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DataProjectsPage />} />
        <Route path="/project-setup" element={<ProjectSetup />} />
        <Route path="/project-setup/substitute" element={<IngredientSubstitutionWorkflow />} /> {/* NEW */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
