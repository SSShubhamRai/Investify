import React, { useState } from 'react';
import { ScoringResult } from '../agent-workflow/agents/scoring_agent';
import ReactMarkdown from 'react-markdown';

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

interface ComprehensiveAnalysisProps {
  investment: InvestmentAnalysis | null;
  founder: FounderAnalysis | null;
  market: MarketAnalysis | null;
  scoring: ScoringResult | null;
  errors: string[];
}

const ComprehensiveAnalysisView: React.FC<ComprehensiveAnalysisProps> = ({
  investment,
  founder,
  market,
  scoring,
  errors
}) => {
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  };

  const getRecommendationColor = (rec: string): string => {
    switch (rec) {
      case 'strong_consider': return 'bg-green-600';
      case 'consider': return 'bg-blue-600';
      case 'needs_review': return 'bg-yellow-600';
      case 'pass': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getRiskColor = (risk: 'high' | 'medium' | 'low'): string => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!investment && !founder && !market && !scoring) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-500">No analysis data available.</p>
        {errors.length > 0 && (
          <div className="mt-4 text-red-500">
            <p className="font-semibold">Errors:</p>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with overall score if available */}
      {scoring && (
        <div className={`p-4 text-white ${getRecommendationColor(scoring.recommendation)}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Investment Analysis</h2>
            <div className="text-2xl font-bold">{scoring.scores.overall}/100</div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm">
              Confidence: {(scoring.confidence_level * 100).toFixed(0)}%
            </div>
            <div className="uppercase font-semibold text-sm tracking-wider">
              {scoring.recommendation.replace('_', ' ')}
            </div>
          </div>
        </div>
      )}

      {/* Scoring Results */}
      {scoring && (
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Team Score */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Team</h4>
                <span className="font-bold">{scoring.scores.team.score}/100</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{scoring.scores.team.assessment}</p>
              {scoring.scores.team.strengths.length > 0 && (
                <div className="text-xs text-green-700">
                  <span className="font-semibold">+ </span>
                  {scoring.scores.team.strengths[0]}
                </div>
              )}
              {scoring.scores.team.weaknesses.length > 0 && (
                <div className="text-xs text-red-700">
                  <span className="font-semibold">- </span>
                  {scoring.scores.team.weaknesses[0]}
                </div>
              )}
            </div>

            {/* Market Score */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Market</h4>
                <span className="font-bold">{scoring.scores.market.score}/100</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{scoring.scores.market.assessment}</p>
              {scoring.scores.market.strengths.length > 0 && (
                <div className="text-xs text-green-700">
                  <span className="font-semibold">+ </span>
                  {scoring.scores.market.strengths[0]}
                </div>
              )}
              {scoring.scores.market.weaknesses.length > 0 && (
                <div className="text-xs text-red-700">
                  <span className="font-semibold">- </span>
                  {scoring.scores.market.weaknesses[0]}
                </div>
              )}
            </div>

            {/* Technical Score */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Technical</h4>
                <span className="font-bold">{scoring.scores.technical.score}/100</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{scoring.scores.technical.assessment}</p>
              {scoring.scores.technical.strengths.length > 0 && (
                <div className="text-xs text-green-700">
                  <span className="font-semibold">+ </span>
                  {scoring.scores.technical.strengths[0]}
                </div>
              )}
              {scoring.scores.technical.weaknesses.length > 0 && (
                <div className="text-xs text-red-700">
                  <span className="font-semibold">- </span>
                  {scoring.scores.technical.weaknesses[0]}
                </div>
              )}
            </div>

            {/* Innovation Score */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Innovation</h4>
                <span className="font-bold">{scoring.scores.innovation.score}/100</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{scoring.scores.innovation.assessment}</p>
              {scoring.scores.innovation.strengths.length > 0 && (
                <div className="text-xs text-green-700">
                  <span className="font-semibold">+ </span>
                  {scoring.scores.innovation.strengths[0]}
                </div>
              )}
              {scoring.scores.innovation.weaknesses.length > 0 && (
                <div className="text-xs text-red-700">
                  <span className="font-semibold">- </span>
                  {scoring.scores.innovation.weaknesses[0]}
                </div>
              )}
            </div>
          </div>

          {/* Key Insights & Risk Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-700">Key Insights</h4>
              <ul className="list-disc list-inside text-sm">
                {scoring.key_insights.map((insight, index) => (
                  <li key={index} className="mb-1">{insight}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-red-700">Risk Factors</h4>
              <ul className="list-disc list-inside text-sm">
                {scoring.risk_factors.map((risk, index) => (
                  <li key={index} className="mb-1">{risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab navigation for detailed analyses */}
      <div className="p-4">
        <div className="border-b border-gray-200 mb-4">
          <ul className="flex flex-wrap -mb-px">
            {investment && (
              <li className="mr-2">
                <button 
                  className="inline-block p-4 border-b-2 border-blue-600 text-blue-600"
                  onClick={() => document.getElementById('investment-tab')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Investment Analysis
                </button>
              </li>
            )}
            {founder && (
              <li className="mr-2">
                <button 
                  className="inline-block p-4 hover:text-blue-600 hover:border-blue-600"
                  onClick={() => document.getElementById('founder-tab')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Team Analysis
                </button>
              </li>
            )}
            {market && (
              <li className="mr-2">
                <button 
                  className="inline-block p-4 hover:text-blue-600 hover:border-blue-600"
                  onClick={() => document.getElementById('market-tab')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Market Analysis
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Investment Analysis Section */}
        {investment && (
          <div id="investment-tab" className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Investment Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Market Size */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Market Size</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">TAM:</span>
                    <span className="font-medium">
                      {formatCurrency(investment.metrics.key_metrics.market_size.tam_usd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Rate:</span>
                    <span className="font-medium">
                      {investment.metrics.key_metrics.market_size.growth_rate_percent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Risk Assessment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Risk:</span>
                    <span className={`font-medium ${getRiskColor(investment.metrics.key_metrics.risk_assessment.overall_risk)}`}>
                      {investment.metrics.key_metrics.risk_assessment.overall_risk.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Key Risks:</span>
                    <ul className="list-disc pl-5 mt-1">
                      {investment.metrics.key_metrics.risk_assessment.key_risks.map((risk: string, index: number) => (
                        <li key={index} className="text-sm">{risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Return Potential */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Return Potential</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated ROI:</span>
                    <span className="font-medium">
                      {investment.metrics.key_metrics.return_potential.estimated_roi_percent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Horizon:</span>
                    <span className="font-medium">
                      {investment.metrics.key_metrics.return_potential.time_horizon_years} years
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg prose prose-sm max-w-none">
              <ReactMarkdown>{investment.analysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Founder Analysis Section */}
        {founder && (
          <div id="founder-tab" className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Team Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Team Composition */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Team Composition</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team Size:</span>
                    <span className="font-medium">{founder.metrics.key_metrics.team_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team Completeness:</span>
                    <span className="font-medium">{founder.metrics.key_metrics.team_completeness}%</span>
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Expertise</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Technical Expertise:</span>
                    <span className={`font-medium ${getRiskColor(founder.metrics.key_metrics.technical_expertise_level === 'high' ? 'low' : founder.metrics.key_metrics.technical_expertise_level === 'medium' ? 'medium' : 'high')}`}>
                      {founder.metrics.key_metrics.technical_expertise_level.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Expertise:</span>
                    <span className={`font-medium ${getRiskColor(founder.metrics.key_metrics.business_expertise_level === 'high' ? 'low' : founder.metrics.key_metrics.business_expertise_level === 'medium' ? 'medium' : 'high')}`}>
                      {founder.metrics.key_metrics.business_expertise_level.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Experience</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Industry Experience:</span>
                    <span className="font-medium">{founder.metrics.key_metrics.industry_experience_years} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Previous Ventures:</span>
                    <span className="font-medium">{founder.metrics.key_metrics.previous_ventures}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`font-medium ${getRiskColor(founder.metrics.key_metrics.risk_level)}`}>
                      {founder.metrics.key_metrics.risk_level.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg prose prose-sm max-w-none">
              <ReactMarkdown>{founder.analysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Market Analysis Section */}
        {market && (
          <div id="market-tab" className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Market Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Market Size */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Market Size</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">TAM:</span>
                    <span className="font-medium">{formatCurrency(market.metrics.key_metrics.market_size.tam_usd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SAM:</span>
                    <span className="font-medium">{formatCurrency(market.metrics.key_metrics.market_size.sam_usd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Rate:</span>
                    <span className="font-medium">{market.metrics.key_metrics.market_size.growth_rate_percent}%</span>
                  </div>
                </div>
              </div>

              {/* Competition */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Competition</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Competitor Count:</span>
                    <span className="font-medium">{market.metrics.key_metrics.competition_metrics.competitor_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Concentration:</span>
                    <span className={`font-medium ${getRiskColor(market.metrics.key_metrics.competition_metrics.market_concentration)}`}>
                      {market.metrics.key_metrics.competition_metrics.market_concentration.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entry Barriers:</span>
                    <span className={`font-medium ${getRiskColor(market.metrics.key_metrics.competition_metrics.barrier_to_entry === 'high' ? 'low' : market.metrics.key_metrics.competition_metrics.barrier_to_entry === 'medium' ? 'medium' : 'high')}`}>
                      {market.metrics.key_metrics.competition_metrics.barrier_to_entry.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Market Dynamics */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Market Dynamics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Stage:</span>
                    <span className="font-medium">{market.metrics.key_metrics.market_dynamics.market_stage.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`font-medium ${getRiskColor(market.metrics.key_metrics.market_dynamics.risk_level)}`}>
                      {market.metrics.key_metrics.market_dynamics.risk_level.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg prose prose-sm max-w-none">
              <ReactMarkdown>{market.analysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Error section if any */}
        {errors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <h4 className="font-semibold text-red-700 mb-2">Errors During Analysis</h4>
            <ul className="list-disc list-inside text-sm text-red-600">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisView; 