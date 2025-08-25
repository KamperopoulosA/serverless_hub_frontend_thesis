import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const PlatformCard = ({ platform, onDelete }) => {
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this platform?')) {
            onDelete(platform.id);
        }
    };

    return (
        <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{platform.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{platform.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {platform.type}
                        </span>
                        <span>Version: {platform.version}</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link to={`/platforms/${platform.id}`}>
                        <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link to={`/platforms/${platform.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            {platform.endpoint && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Endpoint:</span> {platform.endpoint}
                    </p>
                </div>
            )}
        </Card>
    );
};

export default PlatformCard;