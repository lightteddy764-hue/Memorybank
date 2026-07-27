#!/usr/bin/env node
import "dotenv/config"; // Automatically loads .env or .env.local variables
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const NEXT_JS_API_BASE = process.env.NEXT_JS_API_BASE || "https://memorybank-z4dd.onrender.com/api";
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
        description: "Add a new lesson learned, architectural decision, or active context to the connected project's memory bank with optional knowledge graph entity tagging.",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "The detailed context or lesson to save" },
            type: { 
              type: "string", 
              enum: ["activeContext", "lessonsLearned", "architecture", "general"],
              description: "The category of this memory" 
            },
            entities: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of tech stack entities or component keywords (e.g., ['Next.js', 'Supabase', 'Auth'])"
            },
            related_memory_ids: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of UUIDs of past related memories to connect in the knowledge graph"
            }
          },
          required: ["content", "type"],
        },
      },
      {
        name: "get_project_profile",
        description: "Get an instant <50ms profile of the connected project including static architecture facts, active context, and top knowledge graph nodes.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "create_project",
        description: "Create a new Memory Bank project directly from your IDE/AI workspace so you can scope memories for a new repository or feature.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "The name of the new project (e.g. 'Backend Service')" },
            description: { type: "string", description: "Optional summary of what this project is for" }
          },
          required: ["name"],
        },
      },
      {
        name: "list_projects",
        description: "List all existing Memory Bank projects under your account/IP so you can see available project IDs, names, and API keys.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      }
    ],
  };
});

// Handle when the AI actually calls the tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (name === "search_memory" || name === "add_memory" || name === "get_project_profile" || name === "create_project" || name === "list_projects") {
      let endpoint = "/memory/search";
      if (name === "add_memory") endpoint = "/memory/add";
      if (name === "get_project_profile") endpoint = "/memory/profile";
      if (name === "create_project") endpoint = "/project/create";
      if (name === "list_projects") endpoint = "/project/list";
      
      const response = await fetch(`${NEXT_JS_API_BASE}${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify(args || {}),
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
