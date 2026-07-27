import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const NEXT_JS_API_URL = "http://localhost:3000/api/memory";

// Initialize the MCP Server
const server = new Server(
  {
    name: "MemoryBank",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the tools we expose to the AI
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_memory",
        description: "Search the project memory bank for past context, architecture decisions, or lessons learned.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "The UUID of the project" },
            query: { type: "string", description: "What to search for" },
          },
          required: ["projectId", "query"],
        },
      },
      {
        name: "add_memory",
        description: "Add a new lesson learned, architectural decision, or active context to the memory bank.",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "The UUID of the project" },
            content: { type: "string", description: "The detailed context or lesson to save" },
            type: { 
              type: "string", 
              enum: ["activeContext", "lessonsLearned", "architecture", "general"],
              description: "The category of this memory" 
            },
          },
          required: ["projectId", "content", "type"],
        },
      }
    ],
  };
});

// Handle when the AI actually calls the tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (name === "search_memory") {
      const response = await fetch(`${NEXT_JS_API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const result = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    if (name === "add_memory") {
      const response = await fetch(`${NEXT_JS_API_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const result = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message }],
    };
  }
});

// Start the stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Memory Bank MCP Server running on stdio");
}

main().catch(console.error);
