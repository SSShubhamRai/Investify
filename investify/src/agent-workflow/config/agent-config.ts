import { OpenAI, OpenAIAgent, FunctionTool } from "llamaindex";

// Agent-specific OpenAI configuration
export const agentOpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4-1106-preview",
    temperature: 0.2,
    maxTokens: 4000,
});

// Factory function for creating consistently configured agents
export function createAgent(tools: FunctionTool<any, any>[], systemPrompt: string) {
    // Ensure each tool has required metadata
    const validatedTools = tools.map(tool => ({
        ...tool,
        metadata: {
            name: tool.metadata?.name || "default_tool",
            description: tool.metadata?.description || "No description provided",
            parameters: tool.metadata?.parameters || {
                type: "object",
                properties: {},
                required: []
            }
        }
    }));

    return new OpenAIAgent({
        llm: agentOpenAI,
        tools: validatedTools,
        verbose: true,
        systemPrompt,
        additionalChatOptions: validatedTools.length > 0 ? {
            functions: validatedTools.map(tool => ({
                name: tool.metadata.name,
                description: tool.metadata.description,
                parameters: tool.metadata.parameters
            })),
            function_call: "auto"
        } : undefined
    });
} 