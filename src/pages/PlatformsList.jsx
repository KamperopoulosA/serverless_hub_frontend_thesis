import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../api/axios';
import PlatformCard from '../components/Platforms/PlatformCard';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const PlatformsList = () => {
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 9;

    useEffect(() => {
        fetchPlatforms();
    }, [currentPage, sortBy, sortOrder, searchQuery]);

    const fetchPlatforms = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage - 1,
                size: pageSize,
                sort: `${sortBy},${sortOrder}`
            };
            
            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await api.get('/platforms', { params });
            setPlatforms(response.data.content || response.data);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch platforms:', error);
            setPlatforms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/platforms/${id}`);
            setPlatforms(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete platform:', error);
            alert('Failed to delete platform');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchPlatforms();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Platforms</h1>
                    <p className="text-gray-600 mt-2">Manage your cloud platforms and services</p>
                </div>
                <Link to="/platforms/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Platform
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search platforms..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="type">Sort by Type</option>
                            <option value="createdAt">Sort by Date</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                        <Button type="submit" variant="outline">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </div>

            {/* Platforms Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : platforms.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {platforms.map((platform) => (
                            <PlatformCard
                                key={platform.id}
                                platform={platform}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2">
                            <Button
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-lg p-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No platforms found</h3>
                        <p className="text-gray-600 mb-4">Get started by creating your first platform</p>
                        <Link to="/platforms/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Platform
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlatformsList;