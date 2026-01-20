import { useState, useCallback, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import { GraphAPI, ChatMessage, AgentHighlights } from '../types/agent';
import { executeAgentTool, getToolDefinitions, ToolExecutionContext } from '../utils/agentTools';
import systemPromptBase from './systemprompt.txt?raw';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseAgentConnectionOptions {
  systemPrompt?: string;
  highlights: AgentHighlights;
  onHighlightsChange: (highlights: AgentHighlights) => void;
}

interface UseAgentConnectionReturn {
  connectionStatus: ConnectionStatus;
  isProcessing: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<ChatMessage[]>;
  clearError: () => void;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for browser-side calls
});

export function useAgentConnection(
  graphAPI: GraphAPI,
  messages: ChatMessage[],
  onMessagesChange: (messages: ChatMessage[]) => void,
  options: UseAgentConnectionOptions
): UseAgentConnectionReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const graphAPIRef = useRef(graphAPI);
  const messagesRef = useRef(messages);
  const optionsRef = useRef(options);

  // Keep refs current
  useEffect(() => {
    graphAPIRef.current = graphAPI;
  }, [graphAPI]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const buildSystemPrompt = useCallback((): string => {
    const api = graphAPIRef.current;
    const allNodes = api.getAllNodes();
    const expandedNodes = api.getExpandedNodes();
    const visibleNodes = api.getVisibleNodeIds();
    const allItems = api.getAllItems();
    const connections = api.getConnections();
    const nodeStatus = api.getNodeStatus();

    const categorySummary = allNodes.map(node => {
      const items = allItems[node.id] || [];
      const status = nodeStatus[node.id];
      return `- ${node.label} (${node.id}): ${items.length} items, ${visibleNodes[node.id] ? 'visible' : 'hidden'}, ${expandedNodes.has(node.id) ? 'expanded' : 'collapsed'}${status?.complete ? ', complete' : ''}`;
    }).join('\n');

    const basePrompt = optionsRef.current.systemPrompt || systemPromptBase;

    return `${basePrompt}

## Current Graph State

### Categories
${categorySummary}

### Summary
- Total categories: ${allNodes.length}
- Expanded nodes: ${expandedNodes.size > 0 ? Array.from(expandedNodes).join(', ') : 'none'}
- Total connections: ${connections.length}`;
  }, []);

  const sendMessage = useCallback(async (content: string): Promise<ChatMessage[]> => {
    setIsProcessing(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const currentMessages = [...messagesRef.current, userMessage];
    onMessagesChange(currentMessages);

    try {
      // Build context for tool execution
      const toolContext: ToolExecutionContext = {
        graphAPI: graphAPIRef.current,
        highlights: optionsRef.current.highlights,
        onHighlightsChange: optionsRef.current.onHighlightsChange,
      };

      // Build OpenAI message history
      const systemPrompt = buildSystemPrompt();
      const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...currentMessages.map(m => {
          if (m.role === 'tool' && m.toolResult) {
            return {
              role: 'tool' as const,
              tool_call_id: m.toolResult.toolCallId,
              content: JSON.stringify(m.toolResult.result),
            };
          }
          // Include tool_calls for assistant messages that have them
          if (m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0) {
            return {
              role: 'assistant' as const,
              content: m.content || null,
              tool_calls: m.toolCalls.map(tc => ({
                id: tc.id,
                type: 'function' as const,
                function: {
                  name: tc.name,
                  arguments: JSON.stringify(tc.arguments),
                },
              })),
            };
          }
          return {
            role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
            content: m.content,
          };
        }),
      ];

      // Get tool definitions
      const tools = getToolDefinitions() as OpenAI.Chat.ChatCompletionTool[];

      // Process with tool calling loop
      const newMessages: ChatMessage[] = [];
      let continueLoop = true;

      while (continueLoop) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: apiMessages,
          tools,
          tool_choice: 'auto',
        });

        const choice = response.choices[0];
        const assistantMessage = choice.message;

        // Check if we have tool calls
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          // Add assistant message with tool calls to API messages
          apiMessages.push(assistantMessage);

          // Store assistant message with toolCalls for chat history
          const toolCallsForHistory = assistantMessage.tool_calls.map(tc => {
            const toolCall = tc as { id: string; function: { name: string; arguments: string } };
            return {
              id: toolCall.id,
              name: toolCall.function.name,
              arguments: JSON.parse(toolCall.function.arguments) as Record<string, unknown>,
            };
          });
          const assistantWithToolsMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: assistantMessage.content || '',
            timestamp: new Date(),
            toolCalls: toolCallsForHistory,
          };
          newMessages.push(assistantWithToolsMsg);

          // Execute each tool call
          for (const toolCall of assistantMessage.tool_calls) {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);

            let toolResult: unknown;
            let success = true;

            try {
              toolResult = executeAgentTool(toolName, toolArgs, toolContext);
            } catch (err) {
              success = false;
              toolResult = { error: err instanceof Error ? err.message : 'Tool execution failed' };
            }

            // Create tool message for UI
            const toolMessage: ChatMessage = {
              id: `tool-${Date.now()}-${toolCall.id}`,
              role: 'tool',
              content: `Executed ${toolName}`,
              timestamp: new Date(),
              toolResult: {
                toolCallId: toolCall.id,
                success,
                result: toolResult,
              },
            };
            newMessages.push(toolMessage);

            // Add tool result to API messages
            apiMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            });
          }
        } else {
          // No more tool calls, we have the final response
          continueLoop = false;

          if (assistantMessage.content) {
            const responseMessage: ChatMessage = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: assistantMessage.content,
              timestamp: new Date(),
            };
            newMessages.push(responseMessage);
          }
        }

        // Safety check: if finish_reason is 'stop', exit the loop
        if (choice.finish_reason === 'stop') {
          continueLoop = false;
        }
      }

      const finalMessages = [...currentMessages, ...newMessages];
      onMessagesChange(finalMessages);

      return finalMessages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(new Error(errorMessage));

      const errorResponse: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };

      const finalMessages = [...currentMessages, errorResponse];
      onMessagesChange(finalMessages);

      return finalMessages;
    } finally {
      setIsProcessing(false);
    }
  }, [onMessagesChange, buildSystemPrompt]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    connectionStatus,
    isProcessing,
    error,
    sendMessage,
    clearError,
  };
}
