// client.js - OpenAI client for MCP with fixed tool handling
import { config } from 'dotenv';
import readline from 'readline/promises';
import OpenAI from 'openai';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

config();

let tools = [];
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const mcpClient = new Client({
    name: "example-client",
    version: "1.0.0",
});

const chatHistory = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Connect to MCP server
mcpClient.connect(new SSEClientTransport(new URL("http://localhost:3001/sse")))
    .then(async () => {
        console.log("Connected to MCP server");
        // Get available tools from the server
        const toolsList = await mcpClient.listTools();
        tools = toolsList.tools.map(tool => {
            return {
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: {
                        type: tool.inputSchema.type,
                        properties: tool.inputSchema.properties,
                        required: tool.inputSchema.required || Object.keys(tool.inputSchema.properties)
                    }
                }
            };
        });
        
        console.log("Available tools:", tools.map(t => t.function.name).join(", "));
        chatLoop();
    })
    .catch(err => {
        console.error("Failed to connect to MCP server:", err);
        process.exit(1);
    });

// Main chat loop
async function chatLoop() {
    try {
        // Get user input
        const question = await rl.question('You: ');
        
        // Exit if user types "exit"
        if (question.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            process.exit(0);
        }
        
        // Add user message to chat history
        chatHistory.push({
            role: "user",
            content: question
        });
        
        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Use GPT-4o model
            messages: chatHistory,
            tools: tools,
            tool_choice: "auto"
        });
        
        const responseMessage = response.choices[0].message;
        
        // Add assistant's response to chat history
        chatHistory.push(responseMessage);
        
        // Check if there's a tool call
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            console.log("AI wants to use a tool to help with your request...");
            
            // Handle each tool call
            for (const toolCall of responseMessage.tool_calls) {
                const toolCallId = toolCall.id;
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);
                
                console.log(`Calling tool: ${toolName}`);
                
                // Call the tool via MCP client
                let toolResult;
                try {
                    toolResult = await mcpClient.callTool({
                        name: toolName,
                        arguments: toolArgs
                    });
                    
                    const resultText = toolResult.content[0].text;
                    console.log(`Tool result: ${resultText}`);
                    
                    // Add tool result to chat history
                    chatHistory.push({
                        role: "tool",
                        tool_call_id: toolCallId,
                        content: resultText
                    });
                } catch (error) {
                    console.error(`Error calling tool ${toolName}:`, error);
                    // Still need to add a tool response to chat history even if there was an error
                    chatHistory.push({
                        role: "tool",
                        tool_call_id: toolCallId,
                        content: `Error: ${error.message}`
                    });
                }
            }
            
            // Get another completion with the tool results
            const followUpResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: chatHistory
            });
            
            const followUpMessage = followUpResponse.choices[0].message;
            chatHistory.push(followUpMessage);
            
            console.log(`AI: ${followUpMessage.content}`);
        } else {
            // Display the response if no tool calls
            console.log(`AI: ${responseMessage.content}`);
        }
        
        // Continue the chat loop
        chatLoop();
    } catch (error) {
        console.error("Error in chat loop:", error);
        // Continue despite error
        chatLoop();
    }
}