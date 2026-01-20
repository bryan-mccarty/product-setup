import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAgentConnection } from '../hooks/useAgentConnection';
import {
  ChatMessage,
  GraphAPI,
  AgentSidebarProps,
} from '../types/agent';

// Re-export types for backward compatibility
export type { ChatMessage, GraphAPI } from '../types/agent';

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SparkleIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 3v2m0 14v2M5.636 5.636l1.414 1.414m9.9 9.9l1.414 1.414M3 12h2m14 0h2M5.636 18.364l1.414-1.414m9.9-9.9l1.414-1.414" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ToolIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

function MessageBubble({ message, theme }: { message: ChatMessage; theme: ReturnType<typeof useTheme>['theme'] }) {
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '10px',
    }}>
      {!isUser && (
        <div style={{
          width: '28px',
          height: '28px',
          background: isTool ? 'rgba(45, 212, 191, 0.15)' : 'rgba(139, 92, 246, 0.15)',
          border: `1px solid ${isTool ? 'rgba(45, 212, 191, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isTool ? (
            <ToolIcon color="#2DD4BF" />
          ) : (
            <SparkleIcon color="#8B5CF6" />
          )}
        </div>
      )}
      <div style={{
        background: isUser ? 'rgba(45, 212, 191, 0.1)' : theme.inputBg,
        border: `1px solid ${isUser ? 'rgba(45, 212, 191, 0.2)' : theme.border}`,
        padding: '12px 14px',
        borderRadius: '10px',
        fontSize: '13px',
        color: theme.textSecondary,
        lineHeight: 1.6,
        maxWidth: '260px',
      }}>
        {isTool && message.toolResult && (
          <div style={{
            fontSize: '10px',
            color: message.toolResult.success ? '#2DD4BF' : '#F87171',
            marginBottom: '6px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {message.toolResult.success ? 'Tool executed' : 'Tool failed'}
          </div>
        )}
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator({ theme }: { theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <div style={{
        width: '28px',
        height: '28px',
        background: 'rgba(139, 92, 246, 0.15)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <SparkleIcon color="#8B5CF6" />
      </div>
      <div style={{
        background: theme.inputBg,
        border: `1px solid ${theme.border}`,
        padding: '12px 14px',
        borderRadius: '10px',
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: theme.textMuted,
              animation: `typingBounce 1.4s ease-in-out ${i * 0.16}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function AgentSidebar({
  isOpen,
  onToggle,
  graphAPI,
  highlights,
  onHighlightsChange,
  messages,
  onMessagesChange,
  systemPrompt,
}: AgentSidebarProps) {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use agent connection hook for message processing
  const { isProcessing, sendMessage } = useAgentConnection(
    graphAPI,
    messages,
    onMessagesChange,
    {
      systemPrompt,
      highlights,
      onHighlightsChange,
    }
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    const content = inputValue.trim();
    setInputValue('');
    await sendMessage(content);
  }, [inputValue, isProcessing, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle button when sidebar is closed
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.25) 100%)',
          border: `1px solid rgba(139, 92, 246, 0.4)`,
          borderRight: 'none',
          borderRadius: '10px 0 0 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          zIndex: 100,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.35) 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.25) 100%)';
        }}
      >
        <SparkleIcon color="#8B5CF6" />
      </button>
    );
  }

  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }

        .agent-sidebar-messages::-webkit-scrollbar {
          width: 5px;
        }
        .agent-sidebar-messages::-webkit-scrollbar-track {
          background: ${theme.cardBg};
        }
        .agent-sidebar-messages::-webkit-scrollbar-thumb {
          background: ${theme.borderStrong};
          border-radius: 3px;
        }
      `}</style>

      <aside style={{
        width: '340px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `1px solid ${theme.border}`,
        background: theme.background,
        height: '100%',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SparkleIcon color="#8B5CF6" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: theme.text }}>
                Graph Assistant
              </div>
              <div style={{ fontSize: '11px', color: theme.textTertiary }}>
                {isProcessing ? 'Thinking...' : highlights.pills.size > 0 ? 'Items highlighted' : 'Ready to help'}
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme.textMuted,
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.cardBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages area */}
        <div
          className="agent-sidebar-messages"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: theme.textMuted,
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <SparkleIcon color="#8B5CF6" />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: theme.textSecondary, marginBottom: '8px' }}>
                Graph Assistant
              </div>
              <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                Ask me to explore the graph, activate items to see connections, or navigate to specific nodes.
              </div>
            </div>
          )}
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} theme={theme} />
          ))}
          {isProcessing && <TypingIndicator theme={theme} />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${theme.border}`,
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            background: theme.inputBg,
            border: `1px solid ${theme.borderStrong}`,
            borderRadius: '10px',
            padding: '6px 6px 6px 14px',
            transition: 'all 0.15s ease',
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the graph..."
              disabled={isProcessing}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                color: theme.text,
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isProcessing}
              style={{
                width: '36px',
                height: '36px',
                background: inputValue.trim() && !isProcessing
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)'
                  : theme.cardBg,
                border: 'none',
                borderRadius: '8px',
                color: inputValue.trim() && !isProcessing ? 'white' : theme.textMuted,
                cursor: inputValue.trim() && !isProcessing ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                boxShadow: inputValue.trim() && !isProcessing ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none',
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
