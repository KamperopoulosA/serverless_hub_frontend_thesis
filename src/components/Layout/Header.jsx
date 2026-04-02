import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Server, Settings, Search, BarChart3, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useUser } from "../../context/UserContext";
import Button from '../UI/Button';
import useAuth from "../../hooks/useAuth";   // ✅ ADD THIS

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useUser();
    const { isAdmin } = useAuth();  // ✅ GET ADMIN FLAG

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-3">
                        <Server className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">PlatformHub</span>
                    </Link>
                    
                    <nav className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/platforms"
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/platforms') 
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
                                <Link to="/profile">My profile</Link>
                                {/* ADMIN ONLY SECTION */}
                                {isAdmin && (
                                    <Link
                                        to="/admin/users"
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 transition-colors`}
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span>Admin Dashboard</span>
                                    </Link>
                                )}

                                <span className="text-sm text-gray-700">
                                    Welcome, {user?.ourUsers?.name || user?.ourUsers?.email}
                                </span>

                                <Button onClick={handleLogout} variant="outline" size="sm">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="outline" size="sm">
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Login
                                    </Button>
                                </Link>

                                <Link to="/signup">
                                    <Button size="sm">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
