const fs = require('fs');

const filePath = '/Users/bryan/ReactProjects/product_setup/src/pages/project_screens/outcomes-page-themed.tsx';
const backupPath = '/Users/bryan/ReactProjects/product_setup/src/pages/project_screens/outcomes-page-themed.tsx.backup2';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import for ProjectPageLayout
content = content.replace(
  "import { useData } from '../../contexts/DataContext';",
  "import { useData } from '../../contexts/DataContext';\nimport { ProjectPageLayout, ChatMessage } from '../../components/project-setup/ProjectPageLayout';"
);

// 2. Remove stepper state/logic (lines around currentStep, steps, getStepStatus, getStepClass, progressPercentage)
const stepperStateRegex = /  \/\/ Progress stepper - Step 5 is Outcomes\s+const currentStep = 5;\s+const steps = \[[^\]]+\];\s+const getStepStatus = \(stepNumber\) => \{[^}]+\};\s+const getStepClass = \(step\) => \{[^}]+\};\s+const progressPercentage = \([^;]+\);/s;
content = content.replace(stepperStateRegex, '');

// 3. Update chat state - change to ChatMessage[] and add handleSendMessage
content = content.replace(
  /  \/\/ Chat state\s+const \[chatMessages, setChatMessages\] = useState\(\[\s+\{\s+id: '1',\s+role: 'assistant',\s+content: "[^"]+"\s+\}\s+\]\);\s+const \[chatOutcome, setChatOutcome\] = useState\(''\);/s,
  `  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'll help you configure outcomes for this project. You can import defaults from the product, add from the library, or create new outcomes."
    }
  ]);

  const handleSendMessage = (message: string) => {
    setChatMessages([
      ...chatMessages,
      { id: generateId(), role: 'user', content: message },
      { id: generateId(), role: 'assistant', content: "That's a great approach. For brownie formulations, you'll want to carefully balance the sugar reduction with other sweeteners or flavor enhancers. Consider your texture goals alongside taste targets." }
    ]);
  };`
);

// 4. Remove sendMessage function
content = content.replace(
  /  const sendMessage = \(\) => \{[^}]+\};\s*/s,
  ''
);

// 5. Remove page-container, main-content, stepper-*, and chat-panel styles
// Find and remove the styles section from SKELETON STYLES to TABLE STYLES
const stylesToRemove = /        \/\* SKELETON STYLES[^*]*\*\/\s+\.page-container \{[\s\S]*?\/\* ===== TABLE STYLES =====/;
content = content.replace(stylesToRemove, '        /* ===== TABLE STYLES =====');

// 6. Replace the JSX structure - remove stepper header, change page-container to ProjectPageLayout, remove chat panel
// Find and replace the main return JSX
const jsxRegex = /<div className="page-container">\s+<main className="main-content">\s+\{\/\* Stepper Header \*\/\}[\s\S]*?<\/main>\s+\{\/\* Chat Panel \*\/\}\s+<aside className="chat-panel">[\s\S]*?<\/aside>\s+<\/div>/;

const newJSX = `<ProjectPageLayout
        currentStep={5}
        chatMessages={chatMessages}
        onSendChatMessage={handleSendMessage}
        chatSubtitle="Outcome Configuration Assistant"
      >
        {/* Project Info */}
        <div className="project-info">
          <div className="breadcrumb">Project Overview</div>
          <h1 className="project-title">{projectSummary.title}</h1>
          <p className="project-description">{projectSummary.description}</p>
        </div>

        {/* Section Header */}
        <div className="section-header-container">
          <div className="section-header">
            <h2 className="section-title">Outcomes</h2>
            <div className="section-stats">
              <span className="stat-badge confirmed">
                <CheckIcon /> {confirmedCount} Confirmed
              </span>
              <span className="stat-badge draft">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l2 2" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                {draftCount} Draft
              </span>
            </div>
          </div>
          <p className="section-subtitle">
            Define what you'll measure in your experiments. Outcomes can be analytical (lab measurements), sensory (taste panels), or consumer metrics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-btn add-new-btn" onClick={handleAddNew}>
            <PlusIcon /> New Outcome
          </button>
          <button className="action-btn library-btn" onClick={() => { setShowLibraryPanel(true); setLibraryTab('product'); }}>
            <ProductIcon /> From Product
          </button>
          <button className="action-btn library-btn" onClick={() => { setShowLibraryPanel(true); setLibraryTab('library'); }}>
            <LibraryIcon /> From Library
          </button>
          <button className="action-btn library-btn" onClick={() => setShowOutcomeExplorer(true)}>
            <MagnifyIcon /> Find New Outcomes
          </button>
        </div>

        {/* Outcomes Table */}
        <div className="table-container">
          <table className="outcomes-table">
            <thead>
              <tr>
                <th>Outcome Name</th>
                <th>Type</th>
                <th>Variable Type</th>
                <th>Range / Levels</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {outcomes.map((outcome) => (
                <OutcomeRow
                  key={outcome.id}
                  outcome={outcome}
                  onUpdate={(updated) => setOutcomes(prev => prev.map(i => i.id === outcome.id ? updated : i))}
                  onDelete={() => setOutcomes(prev => prev.filter(i => i.id !== outcome.id))}
                  onConfirm={() => setOutcomes(prev => prev.map(i => i.id === outcome.id ? { ...i, status: 'confirmed' } : i))}
                  onOpenRangeExplorer={(o) => setRangeExplorerOutcome(o)}
                  allProductOutcomes={productOutcomes}
                  allLibraryOutcomes={libraryOutcomes}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Action Button */}
        <div className="bottom-actions">
          <button className="add-row-btn" onClick={handleAddNew}>
            <PlusIcon /> Add Outcome
          </button>
        </div>
      </ProjectPageLayout>`;

// Replace the JSX - need to match from <div className="page-container"> to </div> before the library panel
const jsxStart = content.indexOf('<div className="page-container">');
const jsxEnd = content.indexOf('{/* Library Panel (Slide-over) */}');

if (jsxStart !== -1 && jsxEnd !== -1) {
  const before = content.substring(0, jsxStart);
  const after = content.substring(jsxEnd);
  content = before + newJSX + '\n\n      ' + after;
}

// Backup and write
fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'));
fs.writeFileSync(filePath, content);

console.log('Refactoring complete! Backup saved to:', backupPath);
