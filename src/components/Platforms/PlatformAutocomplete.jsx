import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import api from '../../api/axios';

const PlatformAutocomplete = ({ onSelect, placeholder = "Search platforms..." }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/platforms/autocomplete?prefix=${encodeURIComponent(query)}`);
                // Backend returns array of strings
                setSuggestions(response.data || []);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (name) => {
        setQuery(name);
        setShowSuggestions(false);
        // Return a consistent object to PlatformSearch
        onSelect({ name });
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            {showSuggestions && (query.length >= 2) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Loading suggestions...
                        </div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((name, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelect(name)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                                <div className="font-medium text-gray-900">{name}</div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No suggestions found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlatformAutocomplete;
