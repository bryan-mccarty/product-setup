import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export type StepStatus = 'completed' | 'current' | 'draft' | 'incomplete' | 'upcoming';

export interface Step {
  number: number;
  name: string;
}

export const PROJECT_STEPS: Step[] = [
  { number: 1, name: 'Basic Information' },
  { number: 2, name: 'Define Goals / Claims' },
  { number: 3, name: 'Select Inputs' },
  { number: 4, name: 'Define Constraints' },
  { number: 5, name: 'Select Outcomes' },
  { number: 6, name: 'Set Objectives' },
  { number: 7, name: 'Prioritize Objectives' },
  { number: 8, name: 'Review' },
];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 7l4 4 6-8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface StepperProps {
  currentStep: number;
  stepStatuses?: Record<number, StepStatus>;
  onStepClick?: (stepNumber: number) => void;
}

export function Stepper({ currentStep, stepStatuses = {}, onStepClick }: StepperProps) {
  const { theme } = useTheme();

  const getStepStatus = (stepNumber: number): StepStatus => {
    if (stepStatuses[stepNumber]) return stepStatuses[stepNumber];
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepClass = (stepNumber: number): string => {
    const status = getStepStatus(stepNumber);
    if (status === 'upcoming') return 'upcoming';
    if (status === 'current') return 'current';
    if (status === 'draft') return 'draft';
    if (status === 'incomplete') return 'incomplete';
    return 'completed';
  };

  const progressPercentage = ((currentStep - 1) / (PROJECT_STEPS.length - 1)) * 100;

  return (
    <>
      <style>{`
        .stepper-header-section {
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid ${theme.border};
        }

        .stepper-container {
          width: 100%;
        }

        .stepper-top {
          margin-bottom: 20px;
        }

        .stepper-title {
          font-size: 15px;
          font-weight: 600;
          color: ${theme.text};
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }

        .stepper-subtitle {
          font-size: 12px;
          color: ${theme.textTertiary};
          font-weight: 400;
        }

        .progress-wrapper {
          position: relative;
          margin-bottom: 16px;
        }

        .progress-line-container {
          position: absolute;
          top: 16px;
          left: 0;
          right: 0;
          height: 2px;
          display: flex;
          align-items: center;
          padding: 0 16px;
        }

        .progress-line-bg {
          flex: 1;
          height: 2px;
          background: ${theme.borderStrong};
          border-radius: 1px;
          position: relative;
        }

        .progress-line-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: linear-gradient(90deg, ${theme.accentInputs} 0%, ${theme.accentInputs} 100%);
          border-radius: 1px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 12px rgba(45, 212, 191, 0.4);
        }

        .steps-container {
          position: relative;
          display: flex;
          justify-content: space-between;
          z-index: 1;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .step-circle-wrapper {
          position: relative;
        }

        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          font-size: 12px;
          transition: all 0.25s ease;
          cursor: pointer;
          background: ${theme.surfaceElevated};
        }

        .step-circle.completed {
          background: linear-gradient(135deg, ${theme.accentInputs} 0%, ${theme.accentInputs} 100%);
          color: ${theme.background};
          border: none;
        }

        .step-circle.current {
          background: linear-gradient(135deg, ${theme.accentInputs} 0%, ${theme.accentInputs} 100%);
          color: ${theme.background};
          border: none;
          box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2), 0 0 20px rgba(45, 212, 191, 0.3);
        }

        .step-circle.upcoming {
          background: ${theme.surfaceElevated};
          color: ${theme.textMuted};
          border: 1px solid rgba(255,255,255,0.1);
        }

        .step-circle.draft {
          background: rgba(251, 146, 60, 0.15);
          color: #fb923c;
          border: 2px dashed #fb923c;
          box-shadow: 0 0 12px rgba(251, 146, 60, 0.3);
        }

        .step-circle.incomplete {
          background: ${theme.surfaceElevated};
          color: ${theme.textMuted};
          border: 2px solid #f59e0b;
        }

        .step-circle:hover {
          transform: scale(1.08);
        }

        .step-label {
          margin-top: 8px;
          text-align: center;
          max-width: 75px;
          font-size: 10px;
          font-weight: 500;
          line-height: 1.3;
        }

        .step-label.current {
          color: ${theme.accentInputs};
        }

        .step-label.completed {
          color: ${theme.textSecondary};
        }

        .step-label.upcoming {
          color: ${theme.textMuted};
        }

        .step-label.draft {
          color: ${theme.textMuted};
        }

        .step-label.incomplete {
          color: #f59e0b;
        }
      `}</style>

      <header className="stepper-header-section">
        <div className="stepper-container">
          <div className="stepper-top">
            <h2 className="stepper-title">Project Setup</h2>
            <p className="stepper-subtitle">
              Step {currentStep} of {PROJECT_STEPS.length} • {Math.round(progressPercentage)}% Complete
            </p>
          </div>

          <div className="progress-wrapper">
            <div className="progress-line-container">
              <div className="progress-line-bg">
                <div
                  className="progress-line-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="steps-container">
              {PROJECT_STEPS.map((step) => {
                const status = getStepStatus(step.number);
                const stepClass = getStepClass(step.number);

                return (
                  <div key={step.number} className="step">
                    <div className="step-circle-wrapper">
                      <div
                        className={`step-circle ${stepClass}`}
                        onClick={() => onStepClick?.(step.number)}
                      >
                        {status === 'completed' ? <CheckIcon /> : step.number}
                      </div>
                    </div>
                    <div className={`step-label ${stepClass}`}>
                      {step.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
