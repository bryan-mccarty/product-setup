import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/finished_dashboard.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { DataProvider } from './contexts/DataContext'
import AppHeader from './components/AppHeader'
import GettingStartedPage from './pages/project_screens/getting-started-themed.tsx'
import GoalsClaimsPage from './pages/project_screens/goals-claims-themed.tsx'
import InputsPage from './pages/project_screens/inputs-page-themed.tsx'
import ConstraintsPage from './pages/project_screens/all-constraints-page-themed.tsx'
import OutcomesPage from './pages/project_screens/outcomes-page-themed.tsx'
import ObjectivesPage from './pages/project_screens/all-objectives-page-themed.tsx'
import ObjectivePrioritizationPage from './pages/project_screens/objective-prioritization-themed.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <AppHeader />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/new/step-1" element={<GettingStartedPage />} />
            <Route path="/project/new/step-2" element={<GoalsClaimsPage />} />
            <Route path="/project/new/step-3" element={<InputsPage />} />
            <Route path="/project/new/step-4" element={<ConstraintsPage />} />
            <Route path="/project/new/step-5" element={<OutcomesPage />} />
            <Route path="/project/new/step-6" element={<ObjectivesPage />} />
            <Route path="/project/new/step-7" element={<ObjectivePrioritizationPage />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  </StrictMode>,
)
