import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { supabase } from '@/utils/supabase/client';
import { NextResponse } from "next/server";

// We create a global variable to keep the MCP server alive in serverless environments (like Vercel)
// Note: In strict serverless environments with cold starts, SSE can be tricky. 
// Vercel supports long-running connections in certain tiers or requires edge runtime.
let mcpServer: Server | null = null;
let transport: SSEServerTransport | null = null;

function getOrCreateServer() {
  if (mcpServer && transport) return { server: mcpServer, transport };

  mcpServer = new Server({ name: "MemoryBank", version: "1.0.0" }, { capabilities: { tools: {} } });
  transport = new SSEServerTransport("/api/mcp/message"); // The endpoint where clients POST messages

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "search_memory",
          description: "Search the project memory bank for past context.",
          inputSchema: {
            type: "object",
            properties: { projectId: { type: "string" }, query: { type: "string" } },
            required: ["projectId", "query"],
          },
        },
        {
          name: "add_memory",
          description: "Add a new lesson learned, architectural decision, or active context.",
          inputSchema: {
            type: "object",
            properties: {
              projectId: { type: "string" },
              content: { type: "string" },
              type: { type: "string", enum: ["activeContext", "lessonsLearned", "architecture", "general"] },
            },
            required: ["projectId", "content", "type"],
          },
        }
      ],
    };
  });

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    if (name === "search_memory") {
      const { projectId, query } = args as any;
      const { data, error } = await supabase.from('memories').select('*').eq('project_id', projectId).textSearch('content', query);
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    if (name === "add_memory") {
      const { projectId, content, type } = args as any;
      const { data, error } = await supabase.from('memories').insert([{ project_id: projectId, content, type }]).select().single();
      if (error) throw new Error(error.message);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  return { server: mcpServer, transport };
}

// GET /api/mcp -> Establishes the SSE connection
export async function GET(req: Request) {
  const { server, transport } = getOrCreateServer();
  
  // Create a Response stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      transport.start(controller);
      server.connect(transport);
    },
    cancel() {
      transport.close();
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
