import { createAgent } from '../config/agent-config';
import { SCORING_PROMPT } from './prompts/scoring_prompt';
import { BaseAgent } from '../utils/BaseAgent';

// Define agent result types
interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define the various agent analysis types
interface InvestmentAnalysis {
  analysis: string;
  metrics: any;
}

interface FounderAnalysis {
  analysis: string;
  metrics: any;
}

interface MarketAnalysis {
  analysis: string;
  metrics: any;
}

// Define the agent results structure
interface AgentResults {
  investment_analysis?: AgentResult<InvestmentAnalysis>;
  founder_analysis?: AgentResult<FounderAnalysis>;
  market_analysis?: AgentResult<MarketAnalysis>;
}

// Define the category score interface
export interface CategoryScore {
  score: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  assessment: string;
}

// Define the scoring result interface
export interface ScoringResult {
  scores: {
    overall: number;
    team: CategoryScore;
    market: CategoryScore;
    technical: CategoryScore;
    innovation: CategoryScore;
  };
  recommendation: 'strong_consider' | 'consider' | 'needs_review' | 'pass';
  confidence_level: number;
  key_insights: string[];
  risk_factors: string[];
}

// Helper function to extract structured data from response
function extractScoringResult(content: string): ScoringResult {
  try {
    // First try to find JSON in code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        if (isValidScoringResult(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('[SCORING-DEBUG] Failed to parse JSON from code block');
      }
    }

    // Try to find JSON without code blocks
    try {
      const jsonRegex = /\{[\s\S]*"scores"[\s\S]*"recommendation"[\s\S]*\}/;
      const match = content.match(jsonRegex);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (isValidScoringResult(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('[SCORING-DEBUG] Failed to parse JSON without code blocks:', {
        error: e instanceof Error ? e.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // If we can't parse JSON, extract sections and build a default result
    return createDefaultScoringResult(content);
  } catch (error) {
    console.error('[SCORING-ERROR] Failed to extract scoring result:', error);
    return createDefaultScoringResult("");
  }
}

// Create a default scoring result from text or defaults
function createDefaultScoringResult(content: string): ScoringResult {
  // Extract sections using regex
  const sections = {
    executive: content.match(/Executive Summary:[\s\S]*?(?=\n\n|$)/),
    team: content.match(/Team Analysis:[\s\S]*?(?=\n\n|$)/),
    technical: content.match(/Technical Analysis:[\s\S]*?(?=\n\n|$)/),
    market: content.match(/Market Analysis:[\s\S]*?(?=\n\n|$)/),
    innovation: content.match(/Innovation Assessment:[\s\S]*?(?=\n\n|$)/),
  };

  // Extract overall score
  const overallScore = extractScore(sections.executive?.[0], /Overall score[^:]*:\s*([\d.]+)/) || 50;
  
  // Extract recommendation
  const recommendationMatch = content.match(/Recommendation[^:]*:\s*(strong_consider|consider|needs_review|pass)/i);
  const recommendation = (recommendationMatch?.[1]?.toLowerCase() || 'needs_review') as ScoringResult['recommendation'];
  
  // Extract confidence level
  const confidenceMatch = content.match(/Confidence level[^:]*:\s*([\d.]+)/);
  const confidenceLevel = confidenceMatch ? Math.min(1, Math.max(0, parseFloat(confidenceMatch[1]))) : 0.5;

  // Extract key insights and risk factors
  const keyInsights = extractListItems(content.match(/Key highlights:([^]*?)(?=\n[A-Z]|\n\n|$)/)?.[1] || '');
  const riskFactors = extractListItems(content.match(/Key concerns:([^]*?)(?=\n[A-Z]|\n\n|$)/)?.[1] || '');

  // Build category scores
  return {
    scores: {
      overall: Math.min(100, Math.max(0, overallScore)),
      team: extractCategoryScore(sections.team?.[0]) || createDefaultCategoryScore(),
      market: extractCategoryScore(sections.market?.[0]) || createDefaultCategoryScore(),
      technical: extractCategoryScore(sections.technical?.[0]) || createDefaultCategoryScore(),
      innovation: extractCategoryScore(sections.innovation?.[0]) || createDefaultCategoryScore()
    },
    recommendation,
    confidence_level: confidenceLevel,
    key_insights: keyInsights.length > 0 ? keyInsights : ["Investment requires further analysis"],
    risk_factors: riskFactors.length > 0 ? riskFactors : ["Insufficient data to fully assess risks"]
  };
}

// Create a default category score
function createDefaultCategoryScore(): CategoryScore {
  return {
    score: 50,
    confidence: 0.5,
    strengths: [],
    weaknesses: [],
    assessment: "Insufficient data for detailed assessment"
  };
}

// Helper to extract score from text
function extractScore(text: string | undefined, pattern: RegExp): number | null {
  if (!text) return null;
  const match = text.match(pattern);
  return match ? Math.min(100, Math.max(0, parseFloat(match[1]))) : null;
}

// Helper to extract list items
function extractListItems(text: string): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim());
}

// Helper to extract category score
function extractCategoryScore(text: string | undefined): CategoryScore | null {
  if (!text) return null;

  const score = extractScore(text, /Score[^:]*:\s*([\d.]+)/) || 50;
  const confidenceMatch = text.match(/Confidence level[^:]*:\s*([\d.]+)/);
  const confidence = confidenceMatch ? Math.min(1, Math.max(0, parseFloat(confidenceMatch[1]))) : 0.5;
  
  const strengths = extractListItems(text.match(/Strengths:([^]*?)(?=\n[A-Z]|\n\n|$)/)?.[1] || '');
  const weaknesses = extractListItems(text.match(/Weaknesses:([^]*?)(?=\n[A-Z]|\n\n|$)/)?.[1] || '');
  const assessment = text.match(/Assessment:([^]*?)(?=\n[A-Z]|\n\n|$)/)?.[1]?.trim() || '';

  return {
    score,
    confidence,
    strengths,
    weaknesses,
    assessment
  };
}

// Type guard for scoring result
function isValidScoringResult(obj: any): obj is ScoringResult {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.scores &&
    typeof obj.scores === 'object' &&
    typeof obj.scores.overall === 'number' &&
    typeof obj.confidence_level === 'number' &&
    Array.isArray(obj.key_insights) &&
    Array.isArray(obj.risk_factors) &&
    ['strong_consider', 'consider', 'needs_review', 'pass'].includes(obj.recommendation)
  );
}

// Validate scores
function validateScores(result: ScoringResult): void {
  // Validate overall score
  if (result.scores.overall < 0 || result.scores.overall > 100) {
    result.scores.overall = Math.min(100, Math.max(0, result.scores.overall));
  }

  // Validate category scores
  const categories = ['team', 'technical', 'market', 'innovation'] as const;
  categories.forEach(category => {
    const score = result.scores[category].score;
    if (score < 0 || score > 100) {
      result.scores[category].score = Math.min(100, Math.max(0, score));
    }
    if (result.scores[category].confidence < 0 || result.scores[category].confidence > 1) {
      result.scores[category].confidence = Math.min(1, Math.max(0, result.scores[category].confidence));
    }
  });

  // Validate confidence level
  if (result.confidence_level < 0 || result.confidence_level > 1) {
    result.confidence_level = Math.min(1, Math.max(0, result.confidence_level));
  }
}

export class ScoringAgent extends BaseAgent {
  private agent: any; // OpenAIAgent type

  constructor() {
    super();
    this.agent = createAgent(
      [],
      "You are an expert investment evaluator. Your task is to analyze investment opportunities based on multiple analyses and provide comprehensive scoring assessments."
    );
  }

  validate(input: any): boolean {
    return typeof input === 'object' && 
           typeof input.investment_content === 'string' && 
           input.investment_content.length > 0 &&
           typeof input.agent_results === 'object';
  }

  validateOutput(output: any): boolean {
    return isValidScoringResult(output);
  }

  async process(input: { 
    investment_content: string, 
    agent_results: AgentResults,
    investment_id?: string 
  }): Promise<ScoringResult> {
    console.error('[SCORING-AGENT-DEBUG] Starting scoring analysis:', {
      contentLength: input.investment_content.length,
      investment_id: input.investment_id,
      hasInvestmentAnalysis: !!input.agent_results.investment_analysis?.success,
      hasFounderAnalysis: !!input.agent_results.founder_analysis?.success,
      hasMarketAnalysis: !!input.agent_results.market_analysis?.success,
      timestamp: new Date().toISOString()
    });

    // Prepare agent results for prompt
    const formattedAgentResults = {
      investment_analysis: input.agent_results.investment_analysis?.success 
        ? input.agent_results.investment_analysis.data 
        : undefined,
      founder_analysis: input.agent_results.founder_analysis?.success 
        ? input.agent_results.founder_analysis.data 
        : undefined,
      market_analysis: input.agent_results.market_analysis?.success 
        ? input.agent_results.market_analysis.data 
        : undefined
    };

    // Replace placeholders in prompt
    const prompt = SCORING_PROMPT
      .replace('<INVESTMENT_CONTENT>', input.investment_content)
      .replace('<AGENT_RESULTS>', JSON.stringify(formattedAgentResults, null, 2));

    // Get analysis from agent
    const response = await this.agent.chat({ message: prompt });
    const result = extractScoringResult(response.toString());
    
    // Validate and ensure score ranges are correct
    validateScores(result);

    console.error('[SCORING-AGENT-DEBUG] Completed scoring analysis:', {
      overallScore: result.scores.overall,
      recommendation: result.recommendation,
      confidence: result.confidence_level,
      keyInsightsCount: result.key_insights.length,
      riskFactorsCount: result.risk_factors.length,
      timestamp: new Date().toISOString()
    });

    return result;
  }
} 