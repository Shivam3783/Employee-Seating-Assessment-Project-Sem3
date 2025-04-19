// server.js - Main server file
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { commitToGitHub } from "./mcp.tool.js";
import { z } from "zod";
import OpenAI from "openai";

const server = new McpServer({
    name: "example-server",
    version: "1.0.0"
});

const app = express();

// Add two numbers tool
server.tool(
    "addTwoNumbers",
    "Add two numbers",
    {
        a: z.number(),
        b: z.number()
    },
    async (arg) => {
        const { a, b } = arg;
        return {
            content: [
                {
                    type: "text",
                    text: `The sum of ${a} and ${b} is ${a + b}`
                }
            ]
        }
    }
)

// GitHub commit tool
server.tool(
    "commitToGitHub",
    "Commit changes to a GitHub repository", 
    {
        branch: z.string(),
        message: z.string(),
        repo: z.string().optional()
    }, 
    async (arg) => {
        const { branch, message, repo } = arg;
        return commitToGitHub(branch, message, repo);
    }
)

// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports = {};

app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports[transport.sessionId] = transport;
    res.on("close", () => {
        delete transports[transport.sessionId];
    });
    await server.connect(transport);
});

app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[sessionId];
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(400).send('No transport found for sessionId');
    }
});

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});