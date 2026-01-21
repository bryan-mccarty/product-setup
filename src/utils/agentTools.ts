import { GraphAPI } from '../types/agent';

export interface AgentHighlights {
  pills: Set<string>;
  connections: Set<number>;
}

export interface ToolExecutionContext {
  graphAPI: GraphAPI;
  highlights: AgentHighlights;
  onHighlightsChange: (highlights: AgentHighlights) => void;
}

export function getToolDefinitions() {
  return [
    // === READ TOOLS ===
    {
      type: 'function',
      function: {
        name: 'list_categories',
        description: 'Get a list of all categories in the graph with their item counts, visibility, and expansion state',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'list_items_in_category',
        description: 'Get all items within a specific category',
        parameters: {
          type: 'object',
          properties: {
            categoryId: {
              type: 'string',
              description: 'The category ID (e.g., "inputs", "outcomes", "constraints", "objectives", "calculations")',
            },
          },
          required: ['categoryId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_graph_structure',
        description: 'Get the overall structure of the graph including all categories and summary statistics',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_item_connections',
        description: 'Get all connections involving a specific item',
        parameters: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'The category/node ID (e.g., "inputs")',
            },
            itemId: {
              type: 'string',
              description: 'The item ID within the category',
            },
          },
          required: ['nodeId', 'itemId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'traverse_from_item',
        description: 'Traverse the connection graph starting from a specific item, finding all connected items up to a max depth',
        parameters: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'The starting category/node ID',
            },
            itemId: {
              type: 'string',
              description: 'The starting item ID',
            },
            maxDepth: {
              type: 'number',
              description: 'Maximum traversal depth (default: 10)',
            },
          },
          required: ['nodeId', 'itemId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'query_item_details',
        description: 'Get detailed information about a specific item (placeholder for future external data)',
        parameters: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'The category/node ID',
            },
            itemId: {
              type: 'string',
              description: 'The item ID',
            },
          },
          required: ['nodeId', 'itemId'],
        },
      },
    },

    // === DISPLAY TOOLS ===
    {
      type: 'function',
      function: {
        name: 'activate_item',
        description: 'Activate one or more items to show connections and/or highlight them with amber color',
        parameters: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nodeId: {
                    type: 'string',
                    description: 'The category/node ID (e.g., "inputs")',
                  },
                  itemId: {
                    type: 'string',
                    description: 'The item ID within the category',
                  },
                },
                required: ['nodeId', 'itemId'],
              },
              description: 'Array of items to activate, each with nodeId and itemId',
            },
            mode: {
              type: 'string',
              enum: ['graph', 'amber', 'both'],
              description: '"graph" selects last item (shows connections), "amber" highlights all with amber color, "both" does both',
            },
          },
          required: ['items', 'mode'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'deactivate_item',
        description: 'Clear the currently activated item, removing the DFS highlighting',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'expand_collapse_node',
        description: 'Expand or collapse one or more category nodes to show/hide their items',
        parameters: {
          type: 'object',
          properties: {
            nodeIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of category node IDs to expand or collapse',
            },
            expanded: {
              type: 'boolean',
              description: 'True to expand, false to collapse',
            },
          },
          required: ['nodeIds', 'expanded'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'set_node_visibility',
        description: 'Show or hide a category node in the graph',
        parameters: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'The category node ID',
            },
            visible: {
              type: 'boolean',
              description: 'True to show, false to hide',
            },
          },
          required: ['nodeId', 'visible'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'focus_on_item',
        description: 'Pan and zoom the view to center on a specific item',
        parameters: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'The category node ID containing the item',
            },
            itemId: {
              type: 'string',
              description: 'The item ID to focus on',
            },
            zoom: {
              type: 'number',
              description: 'Optional zoom level (default: current zoom)',
            },
          },
          required: ['nodeId', 'itemId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'focus_on_node',
        description: 'Pan and zoom the view to center on a category node',
        parameters: {
          type: 'object',
          properties: {
            nodeId: {
              type: 'string',
              description: 'The node ID to focus on',
            },
            zoom: {
              type: 'number',
              description: 'Optional zoom level',
            },
          },
          required: ['nodeId'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'set_connection_mode',
        description: 'Change how connections are displayed in the graph',
        parameters: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['all', 'onClick'],
              description: '"all" shows all connections on hover, "onClick" shows connections only for selected item',
            },
          },
          required: ['mode'],
        },
      },
    },
  ];
}

export function executeAgentTool(
  toolName: string,
  parameters: Record<string, unknown>,
  context: ToolExecutionContext
): unknown {
  const { graphAPI, highlights, onHighlightsChange } = context;

  switch (toolName) {
    // === READ TOOLS ===
    case 'list_categories': {
      const allNodes = graphAPI.getAllNodes();
      const allItems = graphAPI.getAllItems();
      const expandedNodes = graphAPI.getExpandedNodes();
      const visibleNodes = graphAPI.getVisibleNodeIds();
      const nodeStatus = graphAPI.getNodeStatus();

      return {
        categories: allNodes.map(node => ({
          id: node.id,
          label: node.label,
          visible: visibleNodes[node.id] ?? false,
          expanded: expandedNodes.has(node.id),
          itemCount: (allItems[node.id] || []).length,
          complete: nodeStatus[node.id]?.complete ?? false,
        })),
      };
    }

    case 'list_items_in_category': {
      const categoryId = parameters.categoryId as string;
      const items = graphAPI.getNodeItems(categoryId);
      return {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
        })),
      };
    }

    case 'get_graph_structure': {
      const allNodes = graphAPI.getAllNodes();
      const allItems = graphAPI.getAllItems();
      const connections = graphAPI.getConnections();
      const expandedNodes = graphAPI.getExpandedNodes();
      const visibleNodes = graphAPI.getVisibleNodeIds();
      const nodeStatus = graphAPI.getNodeStatus();

      const totalItems = Object.values(allItems).reduce((sum, items) => sum + items.length, 0);

      return {
        nodes: allNodes.map(node => ({
          id: node.id,
          label: node.label,
          visible: visibleNodes[node.id] ?? false,
          expanded: expandedNodes.has(node.id),
          itemCount: (allItems[node.id] || []).length,
          complete: nodeStatus[node.id]?.complete ?? false,
        })),
        totalItems,
        totalConnections: connections.length,
        expandedNodes: Array.from(expandedNodes),
        visibleNodes: Object.entries(visibleNodes)
          .filter(([_, v]) => v)
          .map(([k]) => k),
      };
    }

    case 'get_item_connections': {
      const nodeId = parameters.nodeId as string;
      const itemId = parameters.itemId as string;
      const connections = graphAPI.getConnections();
      const itemKey = `${nodeId}-${itemId}`;

      const itemConnections = connections.filter(conn => {
        const fromKey = `${conn.fromNodeId}-${conn.fromItemId}`;
        const toKey = `${conn.toNodeId}-${conn.toItemId}`;
        return fromKey === itemKey || toKey === itemKey;
      });

      return {
        connections: itemConnections.map(conn => ({
          fromNodeId: conn.fromNodeId,
          fromItemId: conn.fromItemId,
          toNodeId: conn.toNodeId,
          toItemId: conn.toItemId,
          relationshipType: conn.relationshipType,
        })),
      };
    }

    case 'traverse_from_item': {
      const nodeId = parameters.nodeId as string;
      const itemId = parameters.itemId as string;
      const maxDepth = (parameters.maxDepth as number) || 10;
      const startKey = `${nodeId}-${itemId}`;

      const visited: Array<{ nodeId: string; itemId: string; depth: number }> = [];
      const seen = new Set<string>();
      const queue: Array<{ key: string; depth: number }> = [{ key: startKey, depth: 0 }];

      const connectionGraph = graphAPI.getConnectionGraph();

      while (queue.length > 0) {
        const { key, depth } = queue.shift()!;
        if (seen.has(key) || depth > maxDepth) continue;
        seen.add(key);

        const [nId, ...rest] = key.split('-');
        const iId = rest.join('-');
        visited.push({ nodeId: nId, itemId: iId, depth });

        const neighbors = connectionGraph[key] || new Set();
        neighbors.forEach(neighborKey => {
          if (!seen.has(neighborKey)) {
            queue.push({ key: neighborKey, depth: depth + 1 });
          }
        });
      }

      return { visited };
    }

    case 'query_item_details': {
      return {
        details: null,
        message: 'Not implemented - placeholder for future external data source',
      };
    }

    // === DISPLAY TOOLS ===
    case 'activate_item': {
      const items = parameters.items as Array<{ nodeId: string; itemId: string }>;
      const mode = parameters.mode as 'graph' | 'amber' | 'both';
      const pillKeys = items.map(item => `${item.nodeId}-${item.itemId}`);

      if (mode === 'graph' || mode === 'both') {
        // Select the last item for graph connections
        const lastPillKey = pillKeys[pillKeys.length - 1];
        graphAPI.selectPill(lastPillKey);
      }
      if (mode === 'amber' || mode === 'both') {
        const newPills = new Set(highlights.pills);
        for (const pillKey of pillKeys) {
          newPills.add(pillKey);
        }
        const newHighlights = {
          pills: newPills,
          connections: highlights.connections,
        };
        onHighlightsChange(newHighlights);
      }

      return { success: true, activated: pillKeys, mode };
    }

    case 'deactivate_item': {
      // Clear graph selection
      graphAPI.selectPill(null);
      // Clear amber highlights
      onHighlightsChange({ pills: new Set(), connections: new Set() });

      return { success: true };
    }

    case 'expand_collapse_node': {
      const nodeIds = parameters.nodeIds as string[];
      const expanded = parameters.expanded as boolean;

      for (const nodeId of nodeIds) {
        if (expanded) {
          graphAPI.expandNode(nodeId);
        } else {
          graphAPI.collapseNode(nodeId);
        }
      }

      return { success: true, nodeIds, expanded };
    }

    case 'set_node_visibility': {
      const nodeId = parameters.nodeId as string;
      const visible = parameters.visible as boolean;

      graphAPI.setNodeVisibility(nodeId, visible);

      return { success: true, nodeId, visible };
    }

    case 'focus_on_item': {
      const nodeId = parameters.nodeId as string;
      const itemId = parameters.itemId as string;
      const zoom = parameters.zoom as number | undefined;

      graphAPI.focusOnItem(nodeId, itemId, zoom);

      return { success: true, focusedOn: { nodeId, itemId } };
    }

    case 'focus_on_node': {
      const nodeId = parameters.nodeId as string;
      const zoom = parameters.zoom as number | undefined;

      graphAPI.focusOnNode(nodeId, zoom);

      return { success: true, focusedOn: nodeId };
    }

    case 'set_connection_mode': {
      const mode = parameters.mode as 'all' | 'onClick';

      graphAPI.setConnectionMode(mode);

      return { success: true, mode };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
