import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/server';

// Remote HTTP / JSON-RPC MCP Server Endpoint (Supermemory Style)
// Allows AI clients (Cursor, Windsurf, Claude) to connect via URL without local CLI files.

export async function GET(request: Request) {
  return NextResponse.json({
    name: "MemoryBank-Remote-MCP",
    version: "1.0.0",
    status: "active",
    protocol: "HTTP/JSON-RPC",
    documentation: "Send POST requests with Authorization: Bearer <api_key> and standard MCP JSON-RPC payload."
  }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        jsonrpc: "2.0", 
        error: { code: -32600, message: "Missing or invalid Authorization header" } 
      }, { status: 401 });
    }
    
    const apiKey = authHeader.replace('Bearer ', '');

    // Validate project API Key
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, name')
      .eq('api_key', apiKey)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ 
        jsonrpc: "2.0", 
        error: { code: -32001, message: "Invalid API Key" } 
      }, { status: 401 });
    }

    const body = await request.json();
    const { jsonrpc, id, method, params } = body;

    // Handle MCP tools/list
    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "search_memory",
              description: "Search the connected project's memory bank using Graph Traversal and keyword matching.",
              inputSchema: {
                type: "object",
                properties: { query: { type: "string" } },
                required: ["query"],
              },
            },
            {
              name: "add_memory",
              description: "Add a new lesson learned, architecture decision, or active context with graph entity tagging.",
              inputSchema: {
                type: "object",
                properties: {
                  content: { type: "string" },
                  type: { type: "string", enum: ["activeContext", "lessonsLearned", "architecture", "general"] },
                  entities: { type: "array", items: { type: "string" } },
                  related_memory_ids: { type: "array", items: { type: "string" } }
                },
                required: ["content", "type"],
              },
            },
            {
              name: "get_project_profile",
              description: "Get an instant <50ms profile of the connected project including static architecture facts and graph nodes.",
              inputSchema: { type: "object", properties: {} },
            },
            {
              name: "create_project",
              description: "Create a new Memory Bank project workspace. Returns the new project ID and its dedicated API key.",
              inputSchema: {
                type: "object",
                properties: {
                  name: { type: "string", description: "The name of the new project." },
                  description: { type: "string", description: "Optional description of the project." }
                },
                required: ["name"],
              },
            }
          ]
        }
      }, { status: 200 });
    }

    // Handle MCP tools/call
    if (method === "tools/call") {
      const { name, arguments: args } = params || {};

      const baseUrl = new URL(request.url).origin;
      let endpoint = "/api/memory/search";
      if (name === "add_memory") endpoint = "/api/memory/add";
      if (name === "get_project_profile") endpoint = "/api/memory/profile";
      if (name === "create_project") endpoint = "/api/project/create";

      const internalRes = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(args || {})
      });

      const data = await internalRes.json();
      if (!internalRes.ok) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32002, message: data.error || "Tool execution failed" }
        }, { status: 500 });
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` }
    }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({
      jsonrpc: "2.0",
      error: { code: -32603, message: err.message }
    }, { status: 500 });
  }
}
