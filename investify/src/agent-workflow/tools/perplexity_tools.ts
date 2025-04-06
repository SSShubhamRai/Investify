import { FunctionTool } from "llamaindex";

const callPerplexity = async ({ query }: { query: string }) => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "sonar-reasoning-pro",
      messages: [
        {
          role: "system",
          content: "You are a research assistant focused on finding accurate, verifiable information about companies, markets, investments, and financial data. Provide detailed, factual responses with relevant dates and specifics when available."
        },
        {
          role: "user",
          content: query
        }
      ],
      max_tokens: 1000,
      temperature: 0.2,
      top_p: 0.9
    })
  };

  try {
    // Check if we're in a development environment without API key
    if (!process.env.PERPLEXITY_API_KEY || process.env.NODE_ENV === 'development') {
      console.log("[PERPLEXITY-MOCK] Using mock response for query:", query);
      return getMockPerplexityResponse(query);
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', options);
    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'No error body');
      console.error("[PERPLEXITY-ERROR] API error details:", {
        status: response.status,
        statusText: response.statusText,
        errorBody,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Perplexity API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.error("[PERPLEXITY-DEBUG] Response:", {
      status: response.status,
      hasChoices: !!data.choices?.length,
      responseLength: data.choices?.[0]?.message?.content?.length,
      timestamp: new Date().toISOString()
    });

    if (!data.choices?.[0]?.message?.content) {
      console.error("[PERPLEXITY-ERROR] Invalid response format:", {
        hasChoices: !!data.choices,
        hasFirstChoice: !!data.choices?.[0],
        hasMessage: !!data.choices?.[0]?.message,
        timestamp: new Date().toISOString()
      });
      throw new Error('Invalid response format from Perplexity API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("[PERPLEXITY-ERROR] API call failed:", error);
    throw error;
  }
};

// Mock response function for development use
function getMockPerplexityResponse(query: string): string {
  // Create relevant mock responses based on the query
  if (query.toLowerCase().includes('market') || query.toLowerCase().includes('industry')) {
    return `Research results for "${query}":
    
The global investment market has shown significant growth over the past decade. Here are some key statistics:
- Total market size: $85.4 trillion as of 2023
- Annual growth rate: 8.7% CAGR over the past 5 years
- Key growth segments: Fintech (22% YoY), Renewable Energy (18% YoY), AI/ML (35% YoY)
- Major market players: BlackRock ($10T AUM), Vanguard ($8.1T AUM), Fidelity ($4.5T AUM)

Market trends indicate continued expansion in digital assets, ESG investing, and alternative investments. Regulatory changes in EU, US, and APAC regions will likely reshape compliance requirements through 2025.`;
  } else if (query.toLowerCase().includes('company') || query.toLowerCase().includes('startup')) {
    return `Research results for "${query}":
    
Company Analysis:
- Founded: 2019
- Founders: Sarah Chen (CEO, ex-Google), Michael Rodriguez (CTO, MIT)
- Total funding: $28.5M across seed and Series A rounds
- Latest valuation: $120M (January 2023)
- Revenue growth: 115% YoY
- Customer base: 230+ enterprise clients
- Key competitors: Innovate Capital (publicly traded), TechFund Solutions (raised $150M), GrowthPath (acquired for $350M in 2022)
- Technology patent portfolio: 8 patents granted, 12 pending
- Team size: 78 employees across 5 countries`;
  } else {
    return `Research results for "${query}":
    
Recent analysis from investment research firm McKinsey shows:
- Investment opportunity size: Estimated $500B market by 2027
- Current penetration: 18% of addressable market
- Key success factors: Proprietary technology (45% contribution), Market timing (30%), Team expertise (25%)
- Risk factors: Regulatory uncertainty (high), Market competition (medium), Technology execution (medium)
- Recent comparable exits: TechVenture ($420M, 8x multiple), InnoGroup ($280M, 5.5x multiple)
- Investment timeframe: 4-6 years to liquidity event
- Expected ROI: 22-30% IRR for early-stage investors`;
  }
}

const perplexityTool = new FunctionTool({
  name: "perplexity",
  description: "Use this tool to research and verify information about investments, markets, companies, and financial data. You should use this tool when you need detailed or up-to-date information.",
  func: async (query: string) => {
    return await callPerplexity({ query });
  },
  metadata: {
    name: "perplexity",
    description: "Research current information about investments, markets, companies and financial data",
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

// Add validation
if (!perplexityTool.metadata?.description) {
    console.error('[PERPLEXITY-ERROR] Tool initialization failed:', {
        hasMetadata: !!perplexityTool.metadata,
        toolKeys: Object.keys(perplexityTool),
        timestamp: new Date().toISOString()
    });
    throw new Error('Perplexity tool missing required metadata');
}

export const perplexityTools = [perplexityTool];