import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Tool } from '@anthropic-ai/sdk/resources/messages';

const MCP_SERVER_URL = 'https://api.motherduck.com/mcp';

interface McpTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Create an MCP client connected to MotherDuck's MCP server
 * @returns Connected MCP client
 */
export async function createMcpClient(): Promise<Client> {
  const token = process.env.MOTHERDUCK_TOKEN;

  if (!token) {
    throw new Error('MOTHERDUCK_TOKEN environment variable is not set');
  }

  const transport = new StreamableHTTPClientTransport(
    new URL(MCP_SERVER_URL),
    {
      requestInit: {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      },
    }
  );

  const client = new Client({
    name: 'mcp-chat',
    version: '1.0.0',
  });

  await client.connect(transport);
  console.log('[MCP] Connected to MotherDuck MCP server');

  return client;
}

/**
 * Get available tools from the MCP server in Claude's tool format
 * @param client - Connected MCP client
 * @returns Array of tools in Anthropic API format
 */
export async function getToolsForClaude(client: Client): Promise<Tool[]> {
  const response = await client.listTools();

  return response.tools.map((tool: McpTool) => ({
    name: tool.name,
    description: tool.description || '',
    input_schema: tool.inputSchema as Tool['input_schema'],
  }));
}

/**
 * Execute a tool call on the MCP server
 * @param client - Connected MCP client
 * @param toolName - Name of the tool to call
 * @param args - Arguments for the tool
 * @returns Tool execution result
 */
export async function executeTool(
  client: Client,
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  console.log(`[MCP] Executing tool: ${toolName}`, args);

  const result = await client.callTool({
    name: toolName,
    arguments: args,
  });

  // Extract text content from the result
  if (result.content && Array.isArray(result.content)) {
    const textContent = result.content
      .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
      .map(c => c.text)
      .join('\n');

    console.log(`[MCP] Tool result (${textContent.length} chars)`);
    return textContent;
  }

  return JSON.stringify(result);
}

/**
 * Close the MCP client connection
 * @param client - MCP client to close
 */
export async function closeMcpClient(client: Client): Promise<void> {
  try {
    await client.close();
    console.log('[MCP] Client connection closed');
  } catch (error) {
    console.error('[MCP] Error closing client:', error);
  }
}
