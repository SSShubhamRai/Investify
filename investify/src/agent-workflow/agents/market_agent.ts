import { createAgent } from '../config/agent-config';
import { perplexityTools } from '../tools/perplexity_tools';
import { MARKET_PROMPT } from './prompts/market_prompt';
import { BaseAgent } from '../utils/BaseAgent';

interface MarketMetrics {
  confidence_score: number;
  key_metrics: {
    market_size: {
      tam_usd: number;  // Total Addressable Market in USD
      sam_usd: number;  // Serviceable Addressable Market in USD
      growth_rate_percent: number;
    };
    competition_metrics: {
      competitor_count: number;
      market_concentration: 'high' | 'medium' | 'low';
      barrier_to_entry: 'high' | 'medium' | 'low';
    };
    market_dynamics: {
      market_stage: 'emerging' | 'growth' | 'mature' | 'declining';
      risk_level: 'high' | 'medium' | 'low';
    };
  };
}

interface MarketAnalysis {
  analysis: string;  // markdown content
  metrics: MarketMetrics;
}

// Default metrics if extraction fails
const DEFAULT_METRICS: MarketMetrics = {
  confidence_score: 0.5,
  key_metrics: {
    market_size: {
      tam_usd: 0,
      sam_usd: 0,
      growth_rate_percent: 0
    },
    competition_metrics: {
      competitor_count: 0,
      market_concentration: 'medium',
      barrier_to_entry: 'medium'
    },
    market_dynamics: {
      market_stage: 'emerging',
      risk_level: 'medium'
    }
  }
};

// Helper function to extract structured data from response
function extractStructuredData(response: string): MarketAnalysis {
  try {
    // First, try to find JSON in code blocks
    const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        console.error('[MARKET-DEBUG] Successfully parsed JSON response:', {
          hasAnalysis: !!parsed.analysis,
          hasMetrics: !!parsed.metrics,
          timestamp: new Date().toISOString()
        });
        return parsed;
      } catch (e) {
        console.error('[MARKET-DEBUG] Failed to parse JSON from code block:', {
          error: e instanceof Error ? e.message : 'Unknown error',
          jsonContent: jsonMatch[1].trim().substring(0, 100) + '...',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Try to find JSON without code blocks
    try {
      const jsonRegex = /\{[\s\S]*"analysis"[\s\S]*"metrics"[\s\S]*\}/;
      const match = response.match(jsonRegex);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.analysis && parsed.metrics) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('[MARKET-DEBUG] Failed to parse JSON without code blocks:', {
        error: e instanceof Error ? e.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // No valid JSON found, return default with raw response as analysis
    console.error('[MARKET-DEBUG] No JSON data found in response');
    return {
      analysis: response,
      metrics: DEFAULT_METRICS
    };
  } catch (error) {
    console.error('[MARKET-ERROR] Failed to extract structured data:', {
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString()
    });
    
    // Return default metrics with error message
    return {
      analysis: `Error extracting data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metrics: DEFAULT_METRICS
    };
  }
}

export class MarketAgent extends BaseAgent {
  private agent: any; // OpenAIAgent type

  constructor() {
    super();
    this.agent = createAgent(
      perplexityTools,
      "You are an expert market analyst evaluating investment opportunities. Your task is to analyze markets, assess competition, and identify growth potential. Use research tools when specific market data is needed."
    );
  }

  validate(input: any): boolean {
    return typeof input === 'object' && 
           typeof input.investment_content === 'string' && 
           input.investment_content.length > 0;
  }

  validateOutput(output: any): boolean {
    return typeof output === 'object' &&
           typeof output.analysis === 'string' &&
           typeof output.metrics === 'object';
  }

  async process(input: { investment_content: string, investment_id?: string }): Promise<MarketAnalysis> {
    console.error('[MARKET-AGENT-DEBUG] Starting market analysis:', {
      contentLength: input.investment_content.length,
      investment_id: input.investment_id,
      timestamp: new Date().toISOString()
    });

    // Replace placeholders in prompt
    const prompt = MARKET_PROMPT.replace(
      '<INVESTMENT_CONTENT>', 
      input.investment_content
    );

    // Get analysis from agent
    const response = await this.agent.chat({ message: prompt });
    const result = extractStructuredData(response.toString());

    console.error('[MARKET-AGENT-DEBUG] Completed market analysis:', {
      hasAnalysis: !!result.analysis,
      analysisLength: result.analysis.length,
      hasMetrics: !!result.metrics,
      tam: result.metrics.key_metrics.market_size.tam_usd,
      growth: result.metrics.key_metrics.market_size.growth_rate_percent,
      stage: result.metrics.key_metrics.market_dynamics.market_stage,
      timestamp: new Date().toISOString()
    });

    return result;
  }
} 