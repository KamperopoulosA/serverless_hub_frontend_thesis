import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const PlatformRanking = () => {
    const [rankings, setRankings] = useState({});
    const [loading, setLoading] = useState(false);
    const [criteria, setCriteria] = useState({
        performance: 0.3,
        cost: 0.3,
        reliability: 0.2,
        ease_of_use: 0.2
    });

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const response = await api.post('/platforms/rank', criteria);
            setRankings(response.data);
        } catch (error) {
            console.error('Failed to fetch rankings:', error);
            setRankings({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRankings();
    }, []);

    const handleCriteriaChange = (key, value) => {
        setCriteria(prev => ({ ...prev, [key]: parseFloat(value) }));
    };

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                    Platform Rankings
                </h1>
                <p className="text-gray-600 mt-2">Weighted ranking of platforms grouped by type</p>
            </div>

            {/* Criteria Configuration */}
            <Card className="p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ranking Criteria</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {Object.entries(criteria).map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                {key.replace('_', ' ')} ({Math.round(value * 100)}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={value}
                                onChange={(e) => handleCriteriaChange(key, e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
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

            {/* Rankings Display */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : Object.keys(rankings).length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(rankings).map(([type, platforms]) => (
                        <Card key={type} className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6 capitalize">
                                {type} Platforms
                            </h2>
                            <div className="space-y-4">
                                {platforms.map((platform, index) => (
                                    <div
                                        key={platform.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(index + 1)}`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                                                <p className="text-sm text-gray-600">{platform.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">
                                                {platform.score ? platform.score.toFixed(2) : 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">Score</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-lg p-8">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No ranking data</h3>
                        <p className="text-gray-600 mb-4">Adjust criteria and click "Update Rankings" to see results</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlatformRanking;