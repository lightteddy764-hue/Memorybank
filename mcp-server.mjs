#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const NEXT_JS_API_URL = "https://memorybank-z4dd.onrender.com/api/memory";
const API_KEY = process.env.MEMORY_BANK_API_KEY;

if (!API_KEY) {
  console.error("Error: MEMORY_BANK_API_KEY environment variable is required.");
  console.error("You can generate this key in your Memory Bank dashboard.");
  process.exit(1);
}

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
        description: "Search the connected project's memory bank for past context, architecture decisions, or lessons learned.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "What to search for" },
          },
          required: ["query"],
        },
      },
      {
        name: "add_memory",
        description: "Add a new lesson learned, architectural decision, or active context to the connected project's memory bank.",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "The detailed context or lesson to save" },
            type: { 
              type: "string", 
              enum: ["activeContext", "lessonsLearned", "architecture", "general"],
              description: "The category of this memory" 
            },
          },
          required: ["content", "type"],
        },
      }
    ],
  };
});

// Handle when the AI actually calls the tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (name === "search_memory" || name === "add_memory") {
      const endpoint = name === "search_memory" ? "/search" : "/add";
      
      const response = await fetch(`${NEXT_JS_API_URL}${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify(args),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      
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
