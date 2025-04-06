import { createAgent } from '../config/agent-config';
import { perplexityTools } from '../tools/perplexity_tools';
import { FOUNDER_PROMPT } from './prompts/founder_prompt';
import { BaseAgent } from '../utils/BaseAgent';

interface FounderMetrics {
  confidence_score: number;
  key_metrics: {
    team_size: number;
    technical_expertise_level: 'high' | 'medium' | 'low';
    business_expertise_level: 'high' | 'medium' | 'low';
    industry_experience_years: number;
    previous_ventures: number;
    team_completeness: number;  // 0-100
    risk_level: 'high' | 'medium' | 'low';
  };
}

interface FounderAnalysis {
  analysis: string;  // markdown content
  metrics: FounderMetrics;
}

// Default metrics if extraction fails
const DEFAULT_METRICS: FounderMetrics = {
  confidence_score: 0.5,
  key_metrics: {
    team_size: 0,
    technical_expertise_level: 'medium',
    business_expertise_level: 'medium',
    industry_experience_years: 0,
    previous_ventures: 0,
    team_completeness: 50,
    risk_level: 'medium'
  }
};

// Helper function to extract structured data from response
function extractStructuredData(response: string): FounderAnalysis {
  try {
    // First, try to find JSON in code blocks
    const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        console.error('[FOUNDER-DEBUG] Successfully parsed JSON response:', {
          hasAnalysis: !!parsed.analysis,
          hasMetrics: !!parsed.metrics,
          timestamp: new Date().toISOString()
        });
        return parsed;
      } catch (e) {
        console.error('[FOUNDER-DEBUG] Failed to parse JSON from code block:', {
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
      console.error('[FOUNDER-DEBUG] Failed to parse JSON without code blocks:', {
        error: e instanceof Error ? e.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // No valid JSON found, return default with raw response as analysis
    console.error('[FOUNDER-DEBUG] No JSON data found in response');
    return {
      analysis: response,
      metrics: DEFAULT_METRICS
    };
  } catch (error) {
    console.error('[FOUNDER-ERROR] Failed to extract structured data:', {
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

export class FounderAgent extends BaseAgent {
  private agent: any; // OpenAIAgent type

  constructor() {
    super();
    this.agent = createAgent(
      perplexityTools,
      "You are an expert at analyzing founding teams and leadership for investment opportunities. Research team members to verify their backgrounds and provide comprehensive team assessments."
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

  async process(input: { investment_content: string, investment_id?: string }): Promise<FounderAnalysis> {
    console.error('[FOUNDER-AGENT-DEBUG] Starting founder analysis:', {
      contentLength: input.investment_content.length,
      investment_id: input.investment_id,
      timestamp: new Date().toISOString()
    });

    // Replace placeholders in prompt
    const prompt = FOUNDER_PROMPT.replace(
      '<INVESTMENT_CONTENT>', 
      input.investment_content
    );

    // Get analysis from agent
    const response = await this.agent.chat({ message: prompt });
    const result = extractStructuredData(response.toString());

    console.error('[FOUNDER-AGENT-DEBUG] Completed founder analysis:', {
      hasAnalysis: !!result.analysis,
      analysisLength: result.analysis.length,
      teamSize: result.metrics.key_metrics.team_size,
      technicalExpertise: result.metrics.key_metrics.technical_expertise_level,
      businessExpertise: result.metrics.key_metrics.business_expertise_level,
      riskLevel: result.metrics.key_metrics.risk_level,
      timestamp: new Date().toISOString()
    });

    return result;
  }
} 