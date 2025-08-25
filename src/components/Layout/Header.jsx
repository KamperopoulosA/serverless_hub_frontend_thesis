import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Server, Settings, Search, BarChart3 } from 'lucide-react';

const Header = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-3">
                        <Server className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">PlatformHub</span>
                    </Link>
                    
                    <nav className="flex space-x-8">
                        <Link
                            to="/"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive('/') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                            <Server className="h-4 w-4" />
                            <span>Platforms</span>
                        </Link>
                        <Link
                            to="/search"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive('/search') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                            <Search className="h-4 w-4" />
                            <span>Search</span>
                        </Link>
                        <Link
                            to="/ranking"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive('/ranking') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span>Ranking</span>
                        </Link>
                        <Link
                            to="/deploy"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive('/deploy') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                            <Settings className="h-4 w-4" />
                            <span>Deploy</span>
                        </Link>
                        <Link
                            to="/credentials"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive('/credentials') 
                                    ? 'text-blue-600 bg-blue-50' 
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                        >
                            <Settings className="h-4 w-4" />
                            <span>Credentials</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;