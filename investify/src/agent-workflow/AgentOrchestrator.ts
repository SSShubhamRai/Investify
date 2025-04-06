import { InvestmentAgent } from './agents/investment_agent';
import { FounderAgent } from './agents/founder_agent';
import { MarketAgent } from './agents/market_agent';
import { ScoringAgent, ScoringResult, CategoryScore } from './agents/scoring_agent';

// Result interfaces
interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

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

// Agent results structure
interface AgentResults {
  investment_analysis?: AgentResult<InvestmentAnalysis>;
  founder_analysis?: AgentResult<FounderAnalysis>;
  market_analysis?: AgentResult<MarketAnalysis>;
}

// Combined analysis result
export interface CombinedAnalysisResult {
  investment: InvestmentAnalysis | null;
  founder: FounderAnalysis | null;
  market: MarketAnalysis | null;
  scoring: ScoringResult | null;
  errors: string[];
  meta: {
    investment_id: string;
    timestamp: string;
    agents_run: string[];
    execution_time_ms: number;
  };
}

export class AgentOrchestrator {
  private investmentAgent: InvestmentAgent;
  private founderAgent: FounderAgent;
  private marketAgent: MarketAgent;
  private scoringAgent: ScoringAgent;
  
  constructor() {
    this.investmentAgent = new InvestmentAgent();
    this.founderAgent = new FounderAgent();
    this.marketAgent = new MarketAgent();
    this.scoringAgent = new ScoringAgent();
  }

  async analyzeInvestment(
    investmentContent: string, 
    options: { 
      investment_id?: string;
      run_investment_agent?: boolean;
      run_founder_agent?: boolean;
      run_market_agent?: boolean;
      run_scoring_agent?: boolean;
    } = {}
  ): Promise<CombinedAnalysisResult> {
    const startTime = Date.now();
    const investment_id = options.investment_id || `investment-${Date.now()}`;
    const errors: string[] = [];
    const agentsRun: string[] = [];
    
    // Default all agents to run unless specified otherwise
    const runInvestmentAgent = options.run_investment_agent !== false;
    const runFounderAgent = options.run_founder_agent !== false;
    const runMarketAgent = options.run_market_agent !== false;
    const runScoringAgent = options.run_scoring_agent !== false;
    
    console.error('[ORCHESTRATOR-DEBUG] Starting analysis:', {
      investment_id,
      contentLength: investmentContent.length,
      runInvestmentAgent,
      runFounderAgent,
      runMarketAgent,
      runScoringAgent,
      timestamp: new Date().toISOString()
    });

    // Initialize results
    const results: AgentResults = {};
    let investmentAnalysis: InvestmentAnalysis | null = null;
    let founderAnalysis: FounderAnalysis | null = null;
    let marketAnalysis: MarketAnalysis | null = null;
    let scoringResult: ScoringResult | null = null;

    // Run investment agent
    if (runInvestmentAgent) {
      try {
        console.error('[ORCHESTRATOR-DEBUG] Running investment agent');
        agentsRun.push('investment');
        
        investmentAnalysis = await this.investmentAgent.execute({
          investment_content: investmentContent,
          investment_id
        });
        
        results.investment_analysis = {
          success: true,
          data: investmentAnalysis
        };
      } catch (error) {
        console.error('[ORCHESTRATOR-ERROR] Investment agent failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Investment agent error: ${errorMessage}`);
        
        results.investment_analysis = {
          success: false,
          error: errorMessage
        };
      }
    }

    // Run founder agent
    if (runFounderAgent) {
      try {
        console.error('[ORCHESTRATOR-DEBUG] Running founder agent');
        agentsRun.push('founder');
        
        founderAnalysis = await this.founderAgent.execute({
          investment_content: investmentContent,
          investment_id
        });
        
        results.founder_analysis = {
          success: true,
          data: founderAnalysis
        };
      } catch (error) {
        console.error('[ORCHESTRATOR-ERROR] Founder agent failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Founder agent error: ${errorMessage}`);
        
        results.founder_analysis = {
          success: false,
          error: errorMessage
        };
      }
    }

    // Run market agent
    if (runMarketAgent) {
      try {
        console.error('[ORCHESTRATOR-DEBUG] Running market agent');
        agentsRun.push('market');
        
        marketAnalysis = await this.marketAgent.execute({
          investment_content: investmentContent,
          investment_id
        });
        
        results.market_analysis = {
          success: true,
          data: marketAnalysis
        };
      } catch (error) {
        console.error('[ORCHESTRATOR-ERROR] Market agent failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Market agent error: ${errorMessage}`);
        
        results.market_analysis = {
          success: false,
          error: errorMessage
        };
      }
    }

    // Run scoring agent if we have results from at least one other agent
    if (runScoringAgent && 
        (results.investment_analysis?.success || 
         results.founder_analysis?.success || 
         results.market_analysis?.success)) {
      try {
        console.error('[ORCHESTRATOR-DEBUG] Running scoring agent');
        agentsRun.push('scoring');
        
        scoringResult = await this.scoringAgent.execute({
          investment_content: investmentContent,
          agent_results: results,
          investment_id
        });
      } catch (error) {
        console.error('[ORCHESTRATOR-ERROR] Scoring agent failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Scoring agent error: ${errorMessage}`);
      }
    } else if (runScoringAgent) {
      const message = 'Scoring agent skipped: No successful agent analyses available';
      console.error('[ORCHESTRATOR-WARNING]', message);
      errors.push(message);
    }

    const executionTime = Date.now() - startTime;
    console.error('[ORCHESTRATOR-DEBUG] Analysis completed:', {
      investment_id,
      executionTime,
      agentsRun,
      errorCount: errors.length,
      timestamp: new Date().toISOString()
    });

    return {
      investment: investmentAnalysis,
      founder: founderAnalysis,
      market: marketAnalysis,
      scoring: scoringResult,
      errors,
      meta: {
        investment_id,
        timestamp: new Date().toISOString(),
        agents_run: agentsRun,
        execution_time_ms: executionTime
      }
    };
  }
} 