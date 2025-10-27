import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const PlatformRanking = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [criteria, setCriteria] = useState([
    { name: "memory", label: "Memory (MB)", weight: 0.25, type: "numeric", direction: "positive", minValue: 128, maxValue: 4096, userValue: "" },
    { name: "maxTimeout", label: "Max Timeout (s)", weight: 0.25, type: "numeric", direction: "negative", minValue: 10, maxValue: 1000, userValue: "" },
    { name: "runtime", label: "Runtime", weight: 0.25, type: "categorical", direction: "positive", categoricalValues: ["nodejs18", "python3.11", "go1.20"], userValue: "" },
    { name: "region", label: "Region", weight: 0.25, type: "categorical", direction: "positive", categoricalValues: ["us-central1", "europe-west1", "asia-east1"], userValue: "" }
  ]);

  const normalizeWeights = (updated) => {
    const total = updated.reduce((sum, c) => sum + c.weight, 0);
    return updated.map(c => ({ ...c, weight: total > 0 ? c.weight / total : 0 }));
  };

  const handleWeightChange = (index, value) => {
    const updated = [...criteria];
    updated[index].weight = parseFloat(value);
    setCriteria(normalizeWeights(updated));
  };

  const handleUserValueChange = (index, value) => {
    const updated = [...criteria];
    updated[index].userValue = value;
    setCriteria(updated);
  };

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await api.post('/platforms/rank', { criteria });

      let flatRankings = [];
      if (Array.isArray(response.data)) {
        response.data.forEach(group => {
          if (group.rankedPlatforms) {
            flatRankings = [...flatRankings, ...group.rankedPlatforms];
          } else {
            flatRankings = [...flatRankings, group];
          }
        });
      }

      flatRankings.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
      setRankings(flatRankings);
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
          Platform Rankings
        </h1>
        <p className="text-gray-600 mt-2">
          Enter your preferred values to calculate platform scores
        </p>
      </div>

      {/* Criteria Configuration */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ranking Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          {criteria.map((criterion, index) => (
            <div key={criterion.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {criterion.label}
              </label>
              {criterion.type === "numeric" ? (
                <input
                  type="number"
                  placeholder={`Enter ${criterion.label}`}
                  value={criterion.userValue}
                  min={criterion.minValue}
                  max={criterion.maxValue}
                  onChange={(e) => handleUserValueChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                />
              ) : (
                <select
                  value={criterion.userValue}
                  onChange={(e) => handleUserValueChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                >
                  <option value="">Select {criterion.label}</option>
                  {criterion.categoricalValues.map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              )}

              {/* 🔸 COMMENTED OUT — Weight label and slider */}
              {/*
              <label className="block text-sm text-gray-600 mb-1">
                Weight ({Math.round(criterion.weight * 100)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={criterion.weight}
                onChange={(e) => handleWeightChange(index, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              */}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={fetchRankings} loading={loading}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Update Rankings
          </Button>
        </div>
      </Card>

      {/* Rankings Display */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : rankings.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Platforms Ranked</h2>
          <div className="space-y-4">
            {rankings.map((platform, index) => (
              <div
                key={platform.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4 mb-2 md:mb-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(index + 1)}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                    <div className="mt-1 text-sm text-gray-700 space-y-0.5">
                      {Object.entries(platform.features || {}).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {platform.totalScore ? platform.totalScore.toFixed(2) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ranking data</h3>
            <p className="text-gray-600 mb-4">
              Enter values and click "Update Rankings" to see results
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformRanking;
