import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, ExternalLink, Calendar, Tag } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import useAuth from '../hooks/useAuth'; // ✅ import for role check

const PlatformDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth(); // ✅ check user role
    const [platform, setPlatform] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlatform();
    }, [id]);

    const fetchPlatform = async () => {
        try {
            const response = await api.get(`/platforms/${id}`);
            setPlatform(response.data);
        } catch (error) {
            console.error('Failed to fetch platform:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this platform?')) {
            try {
                await api.delete(`/platforms/${id}`);
                navigate('/');
            } catch (error) {
                console.error('Failed to delete platform:', error);
                alert('Failed to delete platform');
            }
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-center items-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    if (!platform) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-900">Platform not found</h2>
                    <Link to="/">
                        <Button className="mt-4">Back to Platforms</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="mr-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{platform.name}</h1>
                        <div className="flex items-center space-x-4 mt-2">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {platform.type}
                            </span>
                            <span className="text-gray-500 text-sm">Version {platform.version}</span>
                        </div>
                    </div>
                </div>

                {/* ✅ Only admins see Edit/Delete */}
                {isAdmin && (
                    <div className="flex space-x-3">
                        <Link to={`/platforms/${id}/edit`}>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="danger" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <p className="text-gray-900">{platform.description || 'No description provided'}</p>
                            </div>
                            {platform.endpoint && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                                    <div className="flex items-center space-x-2">
                                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{platform.endpoint}</code>
                                        <a
                                            href={platform.endpoint}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {platform.configuration && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
                            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                {JSON.stringify(platform.configuration, null, 2)}
                            </pre>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            {/* ✅ Everyone can deploy */}
                            <Link to={`/deploy?platformId=${id}`} className="block">
                                <Button className="w-full">
                                    Deploy Function
                                </Button>
                            </Link>

                            {/* ✅ Only admin can edit */}
                            {isAdmin && (
                                <Link to={`/platforms/${id}/edit`} className="block">
                                    <Button variant="outline" className="w-full">
                                        Edit Platform
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-2">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">ID:</span>
                                <span className="font-mono text-gray-900">{platform.id}</span>
                            </div>
                            {platform.createdAt && (
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">Created:</span>
                                    <span className="text-gray-900">
                                        {new Date(platform.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PlatformDetail;
