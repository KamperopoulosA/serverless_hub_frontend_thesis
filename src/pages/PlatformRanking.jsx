import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const PlatformRanking = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [criteria, setCriteria] = useState([
    { name: "memory", label: "Memory (MB)", weight: 0.25, type: "numeric", direction: "positive" },
    { name: "maxTimeout", label: "Max Timeout (s)", weight: 0.25, type: "numeric", direction: "negative" },

    {
      name: "runtime",
      label: "Runtime",
      weight: 0.25,
      type: "categorical_multiple",
      direction: "positive",
      options: ["nodejs18", "python3.11", "go1.20"],
      selectedValues: []
    },

    {
      name: "languages",
      label: "Languages",
      weight: 0.25,
      type: "categorical_multiple",
      direction: "positive",
      options: ["nodejs", "python", "java", "go"],
      selectedValues: []
    }
  ]);

  // Normalize weights
  const normalizeWeights = (updated) => {
    const total = updated.reduce((sum, c) => sum + c.weight, 0);
    return updated.map(c => ({ ...c, weight: total > 0 ? c.weight / total : 0 }));
  };

  const handleWeightChange = (index, value) => {
    const updated = [...criteria];
    updated[index].weight = parseFloat(value);
    setCriteria(normalizeWeights(updated));
  };

  // MULTI SELECT handler
  const handleMultiSelectChange = (index, e) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);

    const updated = [...criteria];
    updated[index].selectedValues = values;

    setCriteria(updated);
  };

  const fetchRankings = async () => {
    setLoading(true);

    try {
      const payload = criteria.map(c => ({
        name: c.name,
        weight: c.weight,
        type: c.type,
        direction: c.direction,
        categoricalValues: c.selectedValues || []
      }));

      const response = await api.post('/platforms/rank', { criteria: payload });

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
          Select capabilities and adjust weights to calculate platform scores
        </p>
      </div>

      {/* Criteria */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ranking Criteria</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">

          {criteria.map((criterion, index) => (
            <div key={criterion.name}>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                {criterion.label}
              </label>

              {/* NUMERIC → no input */}
              {criterion.type === "numeric" ? (
                <div className="text-xs text-gray-500 mb-2">
                  Auto-calculated (min-max normalization)
                </div>

              ) : (
                <>
                  <select
                    multiple
                    onChange={(e) => handleMultiSelectChange(index, e)}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-2 h-28"
                  >
                    {criterion.options.map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>

                  <p className="text-xs text-gray-400">
                    Ctrl/Cmd + click for multiple selection
                  </p>
                </>
              )}

              {/* Weight */}
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

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : rankings.length > 0 ? (
        <Card className="p-6">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            All Platforms Ranked
          </h2>

          <div className="space-y-4">
            {rankings.map((platform, index) => (
              <div
                key={platform.id}
                className="flex justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{platform.name}</h3>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold">
                    {platform.totalScore?.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
              </div>
            ))}
          </div>

        </Card>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No ranking data
        </div>
      )}

    </div>
  );
};

export default PlatformRanking;