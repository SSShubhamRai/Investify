import { FunctionTool } from "llamaindex";

// Mock function for a web search tool (in a real application, you would integrate with a search API)
async function searchWeb(query: string): Promise<string> {
  console.log(`Performing web search for: ${query}`);
  
  // This is a mock - in a real app you would call an actual search API
  return `Search results for "${query}":\n
  - Result 1: Information about market trends
  - Result 2: Recent investment data
  - Result 3: Competitor analysis
  - Result 4: Industry growth projections`;
}

// Web search tool for investment research
export const webSearchTool = new FunctionTool({
  name: "web_search",
  description: "Search the web for recent information about investments, markets, and companies",
  func: async (query: string) => {
    return await searchWeb(query);
  },
  metadata: {
    name: "web_search",
    description: "Searches the web for information related to investments and markets",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to find information"
        }
      },
      required: ["query"]
    }
  }
});

// Collection of web search tools
export const webSearchTools = [webSearchTool]; 