import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  subtitle?: string;
}

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ChatMessageComponent = ({ message, theme }: { message: ChatMessage; theme: any }) => (
  <div className={`chat-message ${message.role}`}>
    {message.role === 'assistant' && (
      <div className="avatar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.accentCombinations} strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
        </svg>
      </div>
    )}
    <div className="message-content">{message.content}</div>
  </div>
);

export function ChatPanel({ messages, onSendMessage, subtitle = 'Assistant' }: ChatPanelProps) {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>{`
        .chat-panel {
          background: ${theme.background};
          display: flex;
          flex-direction: column;
          border-left: 1px solid ${theme.border};
          height: 100vh;
        }

        .chat-header {
          padding: 20px 20px;
          border-bottom: 1px solid ${theme.border};
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-header-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-header-text {
          flex: 1;
        }

        .chat-title {
          font-size: 13px;
          font-weight: 600;
          color: ${theme.text};
          margin-bottom: 2px;
        }

        .chat-subtitle {
          font-size: 11px;
          color: ${theme.textTertiary};
        }

        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chat-messages::-webkit-scrollbar {
          width: 5px;
        }
        .chat-messages::-webkit-scrollbar-track {
          background: ${theme.cardBg};
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background: ${theme.borderStrong};
          border-radius: 3px;
        }

        .chat-message {
          display: flex;
          gap: 10px;
        }

        .chat-message.user {
          flex-direction: row-reverse;
        }

        .avatar {
          width: 28px;
          height: 28px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message-content {
          background: ${theme.inputBg};
          border: 1px solid ${theme.border};
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          color: ${theme.textSecondary};
          line-height: 1.6;
          max-width: 280px;
        }

        .chat-message.user .message-content {
          background: rgba(45, 212, 191, 0.1);
          border-color: rgba(45, 212, 191, 0.2);
          color: ${theme.text};
        }

        .chat-input-container {
          padding: 16px 20px;
          border-top: 1px solid ${theme.border};
        }

        .chat-input-wrapper {
          display: flex;
          gap: 10px;
          background: ${theme.inputBg};
          border: 1px solid ${theme.borderStrong};
          border-radius: 10px;
          padding: 6px 6px 6px 14px;
          transition: all 0.15s ease;
        }

        .chat-input-wrapper:focus-within {
          border-color: rgba(139, 92, 246, 0.4);
          background: rgba(139, 92, 246, 0.03);
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          color: ${theme.text};
          font-family: inherit;
        }

        .chat-input::placeholder {
          color: ${theme.textMuted};
        }

        .send-btn {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, ${theme.accentCombinations} 0%, ${theme.accentCombinations} 100%);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }

        .send-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
      `}</style>

      <aside className="chat-panel">
        <div className="chat-header">
          <div className="chat-header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.accentCombinations} strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            </svg>
          </div>
          <div className="chat-header-text">
            <div className="chat-title">Luna AI</div>
            <div className="chat-subtitle">{subtitle}</div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map(message => (
            <ChatMessageComponent key={message.id} message={message} theme={theme} />
          ))}
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              type="text"
              className="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Luna anything..."
            />
            <button className="send-btn" onClick={handleSend}>
              <SendIcon />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
