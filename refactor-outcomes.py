#!/usr/bin/env python3
import re

filePath = '/Users/bryan/ReactProjects/product_setup/src/pages/project_screens/outcomes-page-themed.tsx'

# Read the file
with open(filePath, 'r') as f:
    content = f.read()

# 1. Add import for ProjectPageLayout (already done)

# 2. Remove stepper state/logic
stepper_pattern = r'  // Progress stepper.*?const progressPercentage = \([^;]+\);'
content = re.sub(stepper_pattern, '', content, flags=re.DOTALL)

# 3. chat state already updated with handleSendMessage

# 4. Remove sendMessage function (should already be removed)

# 5. Remove page-container, main-content, stepper-*, and chat-panel styles
# Remove from SKELETON STYLES comment to just before TABLE STYLES
styles_pattern = r'(        /\* SKELETON STYLES[^\*]*\*/\s+)\.page-container \{.*?(        /\* ===== TABLE STYLES =====)'
content = re.sub(styles_pattern, r'\2', content, flags=re.DOTALL)

# 6. Replace the JSX structure
# Find the section from <div className="page-container"> to just before {/* Library Panel */}
jsx_pattern = r'<div className="page-container">.*?</div>\s*(?=\s*\{/\* Library Panel)'

new_jsx = '''<ProjectPageLayout
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
      </ProjectPageLayout>'''

content = re.sub(jsx_pattern, new_jsx, content, flags=re.DOTALL)

# Write back
with open(filePath, 'w') as f:
    f.write(content)

print('Refactoring complete!')
