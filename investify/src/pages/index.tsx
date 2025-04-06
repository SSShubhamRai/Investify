import React, { useState } from 'react';
import { AgentOrchestrator, CombinedAnalysisResult } from '../agent-workflow/AgentOrchestrator';
import ComprehensiveAnalysisView from '../components/ComprehensiveAnalysisView';

// Demo investment for demonstration purposes (would come from user input in a real app)
const DEMO_INVESTMENT = `
Investment Opportunity: Green Energy Storage Solutions Inc.

Company Overview:
Green Energy Storage Solutions Inc. (GESS) is a clean technology company specializing in advanced battery storage systems for renewable energy. They have developed a proprietary lithium-ion battery technology that offers 30% higher energy density and 40% longer lifespan compared to current market leaders. The company was founded in 2018 by former Tesla engineers and has secured two patents for their core technology.

Market Position:
The company targets both residential and commercial markets for renewable energy storage. Their primary product is a modular battery system that can scale from home installations to utility-grade applications. They currently have pilot installations with three major utility companies and partnerships with two leading solar panel manufacturers.

Financial Overview:
- Current valuation: $28 million
- Annual revenue: $3.2 million (projected to reach $8 million next year)
- Current burn rate: $600,000 per month
- Seeking $15 million in Series B funding
- Previous funding: $7 million in seed and Series A
- Path to profitability: 2.5 years with new funding

Technology Differentiators:
- Proprietary battery management system reducing degradation by 25%
- Advanced thermal management system preventing overheating issues
- Software platform for predictive maintenance and grid optimization
- Recyclable components with 85% recovery rate

Competitive Landscape:
Major competitors include Tesla Powerwall, LG Chem RESU, and Sonnen batteries. GESS claims their solutions offer better performance metrics at a 15% lower total cost of ownership over 10 years.

Growth Strategy:
The company plans to expand manufacturing capacity (currently outsourced), increase R&D investment in solid-state battery research, and expand sales channels through strategic partnerships with home builders and renewable energy installers.

Market Trends:
The global energy storage market was valued at $11 billion in 2022 and is expected to grow at a CAGR of 20-25% over the next decade. Growth is driven by increasing renewable energy adoption, grid modernization initiatives, and declining battery costs.

Regulatory Environment:
The Inflation Reduction Act provides tax credits for battery storage systems, creating favorable market conditions in the US. The company's products qualify for these incentives. Similar incentive programs exist in the EU, UK, and Australia.

Exit Opportunities:
Potential exit strategies include acquisition by major energy companies or battery manufacturers, or IPO within 5-7 years.

Team:
- CEO: Dr. Sarah Chen, Ph.D. in Materials Science (Stanford), 12 years at Tesla Energy Division
- CTO: Michael Rodriguez, MS in Electrical Engineering (MIT), previously led R&D at LG Chem
- COO: James Wilson, MBA (Harvard), former operations head at SunPower
- Lead Engineer: Dr. Priya Sharma, Ph.D. in Chemical Engineering, 8 patents in battery technology
- VP Sales: Thomas Brown, 15+ years in renewable energy sales, previously at SolarCity

Identified Risks:
- Technology risks: New competitors with alternative storage technologies
- Supply chain risks: Dependency on rare earth materials
- Regulatory risks: Changing incentive structures
- Execution risks: Scaling manufacturing while maintaining quality
`;

export default function Home() {
  const [investment, setInvestment] = useState(DEMO_INVESTMENT);
  const [analysisResults, setAnalysisResults] = useState<CombinedAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAgents, setSelectedAgents] = useState({
    investment: true,
    founder: true,
    market: true,
    scoring: true
  });

  const handleAgentSelection = (agentType: string) => {
    setSelectedAgents(prev => ({
      ...prev,
      [agentType]: !prev[agentType as keyof typeof prev]
    }));
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const orchestrator = new AgentOrchestrator();
      const result = await orchestrator.analyzeInvestment(investment, {
        investment_id: `invest-${Date.now()}`,
        run_investment_agent: selectedAgents.investment,
        run_founder_agent: selectedAgents.founder,
        run_market_agent: selectedAgents.market,
        run_scoring_agent: selectedAgents.scoring
      });
      
      setAnalysisResults(result);
      
      // Check for errors during analysis
      if (result.errors.length > 0) {
        setError(`Analysis completed with ${result.errors.length} errors. See details in results.`);
      }
    } catch (err) {
      setError('Failed to generate analysis. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">
            Investify
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Advanced AI-powered investment analysis platform. Get deep insights into any investment opportunity with our cutting-edge AI agents.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Investment Details</h2>
              
              <div className="mb-4">
                <label htmlFor="investment" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter investment information:
                </label>
                <textarea
                  id="investment"
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                />
              </div>
              
              <div className="mb-6 border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-700 mb-3">Select Analysis Agents:</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="investment-agent"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded"
                      checked={selectedAgents.investment}
                      onChange={() => handleAgentSelection('investment')}
                    />
                    <label htmlFor="investment-agent" className="ml-2 text-sm text-gray-700">
                      Investment Analysis
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="founder-agent"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded"
                      checked={selectedAgents.founder}
                      onChange={() => handleAgentSelection('founder')}
                    />
                    <label htmlFor="founder-agent" className="ml-2 text-sm text-gray-700">
                      Team Analysis
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="market-agent"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded"
                      checked={selectedAgents.market}
                      onChange={() => handleAgentSelection('market')}
                    />
                    <label htmlFor="market-agent" className="ml-2 text-sm text-gray-700">
                      Market Analysis
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="scoring-agent"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded"
                      checked={selectedAgents.scoring}
                      onChange={() => handleAgentSelection('scoring')}
                    />
                    <label htmlFor="scoring-agent" className="ml-2 text-sm text-gray-700">
                      Investment Scoring
                    </label>
                  </div>
                </div>
              </div>
              
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Analyze Investment'}
              </button>
              
              {error && (
                <div className="mt-4 text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              {isLoading && (
                <div className="mt-6">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    This may take several minutes as our AI agents analyze your investment...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {analysisResults ? (
              <ComprehensiveAnalysisView
                investment={analysisResults.investment}
                founder={analysisResults.founder}
                market={analysisResults.market}
                scoring={analysisResults.scoring}
                errors={analysisResults.errors}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4 text-blue-700">Comprehensive Investment Analysis</h3>
                  <p className="text-gray-500">
                    {isLoading 
                      ? 'Generating analysis...'
                      : 'Enter investment details and click "Analyze Investment" to get started'}
                  </p>
                  {!isLoading && (
                    <div className="mt-6 flex justify-center">
                      <div className="text-sm text-gray-500 max-w-md">
                        <p className="mb-2">Our AI agents will analyze your investment from multiple perspectives:</p>
                        <ul className="list-disc list-inside text-left">
                          <li>Investment potential and return analysis</li>
                          <li>Founder and team capability assessment</li>
                          <li>Market size and competition evaluation</li>
                          <li>Comprehensive investment score and recommendation</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="text-center text-gray-500 text-sm mt-12">
          <p>© 2024 Investify - AI-Powered Investment Analysis</p>
        </footer>
      </div>
    </main>
  );
} 