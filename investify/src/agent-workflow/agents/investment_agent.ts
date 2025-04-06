import { createAgent } from '../config/agent-config';
import { webSearchTools } from '../tools/web_search_tools';
import { INVESTMENT_PROMPT } from './prompts/investment_prompt';
import { BaseAgent } from '../utils/BaseAgent';

interface InvestmentMetrics {
  confidence_score: number;
  key_metrics: {
    market_size: {
      tam_usd: number;        // Total Addressable Market in USD
      growth_rate_percent: number;
    };
    risk_assessment: {
      overall_risk: 'high' | 'medium' | 'low';
      key_risks: string[];
    };
    return_potential: {
      estimated_roi_percent: number;
      time_horizon_years: number;
    };
  };
}

interface InvestmentAnalysis {
  analysis: string;  // markdown content
  metrics: InvestmentMetrics;
}

// Default metrics if extraction fails
const DEFAULT_METRICS: InvestmentMetrics = {
  confidence_score: 0.5,
  key_metrics: {
    market_size: {
      tam_usd: 0,
      growth_rate_percent: 0
    },
    risk_assessment: {
      overall_risk: 'medium',
      key_risks: []
    },
    return_potential: {
      estimated_roi_percent: 0,
      time_horizon_years: 5
    }
  }
};

// Helper function to extract structured data from response
function extractStructuredData(response: string): InvestmentAnalysis {
  try {
    // Try to find JSON in code blocks
    const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        console.error('[INVESTMENT-DEBUG] Successfully parsed JSON response:', {
          hasAnalysis: !!parsed.analysis,
          hasMetrics: !!parsed.metrics,
          timestamp: new Date().toISOString()
        });
        return parsed;
      } catch (e) {
        console.error('[INVESTMENT-DEBUG] Failed to parse JSON from code block:', {
          error: e instanceof Error ? e.message : 'Unknown error',
          jsonContent: jsonMatch[1].trim().substring(0, 100) + '...',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // No valid JSON found, return default with raw response as analysis
    console.error('[INVESTMENT-DEBUG] No JSON data found in response');
    return {
      analysis: response,
      metrics: DEFAULT_METRICS
    };
  } catch (error) {
    console.error('[INVESTMENT-ERROR] Failed to extract structured data:', {
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

export class InvestmentAgent extends BaseAgent {
  private agent: any; // OpenAIAgent type

  constructor() {
    super();
    this.agent = createAgent(
      webSearchTools,
      "You are an expert investment analyst helping evaluate potential investments."
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

  async process(input: { investment_content: string, investment_id?: string }): Promise<InvestmentAnalysis> {
    // Replace placeholders in prompt
    const prompt = INVESTMENT_PROMPT.replace(
      '<INVESTMENT_CONTENT>', 
      input.investment_content
    );

    // Get analysis from OpenAI
    const response = await this.agent.chat({ message: prompt });
    const result = extractStructuredData(response.toString());

    return result;
  }
} 