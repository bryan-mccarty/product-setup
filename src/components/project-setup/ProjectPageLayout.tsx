import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Stepper } from './Stepper';
import type { StepStatus } from './Stepper';
import { ChatPanel } from './ChatPanel';
import type { ChatMessage } from './ChatPanel';

interface ProjectPageLayoutProps {
  currentStep: number;
  stepStatuses?: Record<number, StepStatus>;
  chatSubtitle?: string;
  chatMessages: ChatMessage[];
  onSendChatMessage: (message: string) => void;
  onStepClick?: (stepNumber: number) => void;
  children: React.ReactNode;
}

export function ProjectPageLayout({
  currentStep,
  stepStatuses,
  chatSubtitle = 'Assistant',
  chatMessages,
  onSendChatMessage,
  onStepClick,
  children,
}: ProjectPageLayoutProps) {
  const { theme } = useTheme();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .project-page-container {
          display: grid;
          grid-template-columns: 1fr 380px;
          min-height: 100vh;
          background: ${theme.background};
        }

        .project-main-content {
          padding: 32px 48px;
          overflow-y: auto;
          max-height: 100vh;
          background: linear-gradient(180deg, rgba(45, 212, 191, 0.02) 0%, transparent 40%);
        }
      `}</style>

      <div className="project-page-container">
        <main className="project-main-content">
          <Stepper currentStep={currentStep} stepStatuses={stepStatuses} onStepClick={onStepClick} />
          {children}
        </main>

        <ChatPanel
          messages={chatMessages}
          onSendMessage={onSendChatMessage}
          subtitle={chatSubtitle}
        />
      </div>
    </>
  );
}

export type { ChatMessage } from './ChatPanel';
export type { StepStatus } from './Stepper';
export { PROJECT_STEPS } from './Stepper';
