import React from 'react';
import ReactMarkdown from 'react-markdown';

interface InvestmentMetrics {
  confidence_score: number;
  key_metrics: {
    market_size: {
      tam_usd: number;
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
  analysis: string;
  metrics: InvestmentMetrics;
}

interface InvestmentAnalysisCardProps {
  analysis: InvestmentAnalysis;
  title: string;
}

const formatCurrency = (value: number): string => {
  // Format large numbers as millions or billions
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else {
    return `$${value.toLocaleString()}`;
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

export default function InvestmentAnalysisCard({ analysis, title }: InvestmentAnalysisCardProps) {
  if (!analysis) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading analysis...</div>;
  }

  const { metrics } = analysis;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 p-4 text-white">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center mt-2">
          <div className="text-sm">
            Confidence Score: {(metrics.confidence_score * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Market Size */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Market Size</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">TAM:</span>
                <span className="font-medium">{formatCurrency(metrics.key_metrics.market_size.tam_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growth Rate:</span>
                <span className="font-medium">{metrics.key_metrics.market_size.growth_rate_percent}%</span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Overall Risk:</span>
                <span className={`font-medium ${getRiskColor(metrics.key_metrics.risk_assessment.overall_risk)}`}>
                  {metrics.key_metrics.risk_assessment.overall_risk.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Key Risks:</span>
                <ul className="list-disc pl-5 mt-1">
                  {metrics.key_metrics.risk_assessment.key_risks.map((risk, index) => (
                    <li key={index} className="text-sm">{risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Return Potential */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Return Potential</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated ROI:</span>
                <span className="font-medium">{metrics.key_metrics.return_potential.estimated_roi_percent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Horizon:</span>
                <span className="font-medium">{metrics.key_metrics.return_potential.time_horizon_years} years</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg prose max-w-none">
          <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
          <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
} 