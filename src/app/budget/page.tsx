'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WeddingProfile, BudgetAllocation } from '@/types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Sparkles,
  Calculator,
  Save,
  Download,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface BudgetRecommendation {
  category: string;
  currentAllocation: number;
  recommendedAllocation: number;
  savings: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIInalysis {
  totalSavings: number;
  recommendations: BudgetRecommendation[];
  insights: string[];
  riskFactors: string[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export default function BudgetOptimizerPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIInalysis | null>(null);
  const [budgetAllocation, setBudgetAllocation] = useState<BudgetAllocation>({
    venue: 0,
    catering: 0,
    photography: 0,
    flowers: 0,
    music: 0,
    attire: 0,
    transportation: 0,
    planning: 0,
    other: 0,
  });

  const budgetCategories = [
    { key: 'venue', label: 'Venue & Reception', icon: '🏛️', description: 'Ceremony and reception location' },
    { key: 'catering', label: 'Catering & Bar', icon: '🍽️', description: 'Food, drinks, and service' },
    { key: 'photography', label: 'Photography & Video', icon: '📸', description: 'Photos, videos, and albums' },
    { key: 'flowers', label: 'Flowers & Décor', icon: '🌸', description: 'Bouquets, centerpieces, decorations' },
    { key: 'music', label: 'Music & Entertainment', icon: '🎵', description: 'DJ, band, or ceremony music' },
    { key: 'attire', label: 'Attire & Beauty', icon: '👗', description: 'Dresses, suits, hair, makeup' },
    { key: 'transportation', label: 'Transportation', icon: '🚗', description: 'Getting around on wedding day' },
    { key: 'planning', label: 'Planning & Coordination', icon: '📋', description: 'Wedding planner and coordination' },
    { key: 'other', label: 'Other Expenses', icon: '💍', description: 'Rings, favors, miscellaneous' },
  ];

  useEffect(() => {
    if (profile) {
      // Initialize budget allocation based on profile priorities and total budget
      const totalBudget = profile.total_budget;
      const priorities = profile.priorities;
      
      // Calculate base allocation percentages based on priorities
      const totalPriority = Object.values(priorities).reduce((sum, priority) => sum + priority, 0);
      
      const allocation: BudgetAllocation = {
        venue: Math.round((priorities.venue / totalPriority) * totalBudget),
        catering: Math.round((priorities.catering / totalPriority) * totalBudget),
        photography: Math.round((priorities.photography / totalPriority) * totalBudget),
        flowers: Math.round((priorities.flowers / totalPriority) * totalBudget),
        music: Math.round((priorities.music / totalPriority) * totalBudget),
        attire: Math.round((priorities.attire / totalPriority) * totalBudget),
        transportation: Math.round((priorities.transportation / totalPriority) * totalBudget),
        planning: Math.round((priorities.planning / totalPriority) * totalBudget),
        other: Math.round((priorities.other / totalPriority) * totalBudget),
      };
      
      setBudgetAllocation(allocation);
    }
  }, [profile]);

  const generateAIAnalysis = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          budgetAllocation,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze budget');
      }

      const analysis = await response.json();
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationChange = (category: keyof BudgetAllocation, value: number) => {
    setBudgetAllocation(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const getTotalAllocated = () => {
    return Object.values(budgetAllocation).reduce((sum, amount) => sum + amount, 0);
  };

  const getRemainingBudget = () => {
    return (profile?.total_budget || 0) - getTotalAllocated();
  };

  const getChartData = () => {
    return budgetCategories.map(category => ({
      name: category.label,
      value: budgetAllocation[category.key as keyof BudgetAllocation],
      color: COLORS[budgetCategories.indexOf(category) % COLORS.length]
    })).filter(item => item.value > 0);
  };

  const getComparisonData = () => {
    if (!aiAnalysis) return [];
    
    return aiAnalysis.recommendations.map(rec => ({
      category: rec.category,
      current: rec.currentAllocation,
      recommended: rec.recommendedAllocation,
      savings: rec.savings
    }));
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access Budget Optimizer</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AI-Powered Budget Optimizer
              </h1>
              <p className="text-gray-600">
                Get personalized recommendations to maximize your wedding budget
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ${profile.total_budget.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Budget</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Budget Allocation */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Budget Allocation</h2>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm ${
                  getRemainingBudget() >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getRemainingBudget() >= 0 ? '✓' : '⚠'} ${Math.abs(getRemainingBudget()).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Budget Chart */}
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getChartData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Budget Sliders */}
            <div className="space-y-4">
              {budgetCategories.map(category => (
                <div key={category.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{category.label}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${budgetAllocation[category.key as keyof BudgetAllocation].toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round((budgetAllocation[category.key as keyof BudgetAllocation] / profile.total_budget) * 100)}%
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={profile.total_budget}
                    step="100"
                    value={budgetAllocation[category.key as keyof BudgetAllocation]}
                    onChange={(e) => handleAllocationChange(category.key as keyof BudgetAllocation, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
              <button
                onClick={generateAIAnalysis}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Get AI Analysis</span>
                  </>
                )}
              </button>
            </div>

            {aiAnalysis ? (
              <div className="space-y-6">
                {/* Total Savings */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Potential Savings</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${aiAnalysis.totalSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">
                    {Math.round((aiAnalysis.totalSavings / profile.total_budget) * 100)}% of your total budget
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Recommendations</h3>
                  {aiAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority.toUpperCase()}
                          </span>
                          <span className="font-medium text-gray-900">
                            {budgetCategories.find(c => c.key === rec.category)?.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            Save ${rec.savings.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${rec.currentAllocation.toLocaleString()} → ${rec.recommendedAllocation.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>

                {/* Insights */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Insights</h3>
                  <div className="space-y-2">
                    {aiAnalysis.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Risk Factors</h3>
                  <div className="space-y-2">
                    {aiAnalysis.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for AI Analysis</h3>
                <p className="text-gray-600 mb-4">
                  Click "Get AI Analysis" to receive personalized budget recommendations
                </p>
                <div className="text-sm text-gray-500">
                  Our AI will analyze your priorities, location, and budget to suggest optimal allocations
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            <Save className="h-4 w-4" />
            <span>Save Budget Plan</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
