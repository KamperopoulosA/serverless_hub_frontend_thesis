import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';
import PlatformCard from '../components/Platforms/PlatformCard';
import PlatformAutocomplete from '../components/Platforms/PlatformAutocomplete';

const PlatformSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('basic');
  const { register, handleSubmit, reset } = useForm();

  // ✅ Client-side sort state (ONLY for Basic Search)
  const [basicSortBy, setBasicSortBy] = useState('name');
  const [basicSortDirection, setBasicSortDirection] = useState('ASC');

  // ✅ Client-side sorting helper
  const sortResultsClientSide = (list, sortBy, sortDir) => {
    if (!Array.isArray(list) || list.length === 0) return list;

    const direction = (sortDir || 'ASC').toUpperCase() === 'DESC' ? -1 : 1;

    const getValue = (obj) => {
      const v = obj?.[sortBy];

      // handle dates if you sort by createdAt (optional)
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        const t = v ? new Date(v).getTime() : 0;
        return Number.isFinite(t) ? t : 0;
      }

      // numbers
      if (typeof v === 'number') return v;

      // strings / nulls
      return (v ?? '').toString().toLowerCase().trim();
    };

    return [...list].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);

      // numeric compare
      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * direction;
      }

      // string compare
      return va.localeCompare(vb) * direction;
    });
  };

  const handleBasicSearch = async (data) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(data).forEach((key) => {
        if (data[key]) params.append(key, data[key]);
      });

      const response = await api.get(`/platforms/search?${params}`);

      // backend might return Page<> or array — handle both
      const list = response.data?.content || response.data || [];

      // ✅ fallback sorting client-side (basic only)
      const sorted = sortResultsClientSide(list, basicSortBy, basicSortDirection);

      setResults(sorted);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFullTextSearch = async (data) => {
    setLoading(true);
    try {
      const keyword = data.fulltext?.trim() || '';
      const categoricalFilters = data.categories || [];

      const payload = {
        keyword,
        categoricalFilters,
        page: 0,
        size: 10,
        sortBy: 'name',
        sortDirection: 'ASC',
      };

      const response = await api.post('/platforms/search/fulltext', payload);
      const resList = response.data?.content || [];
      setResults(resList);
    } catch (error) {
      console.error("Error performing fulltext search:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAutocompleteSelect = (platform) => {
    setResults([platform]);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/platforms/${id}`);
      setResults((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete platform:', error);
      alert('Failed to delete platform');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Platforms</h1>
        <p className="text-gray-600 mt-2">Find platforms using various search methods</p>
      </div>

      {/* Search Type Selector */}
      <Card className="p-6 mb-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            variant={searchType === 'basic' ? 'primary' : 'outline'}
            onClick={() => setSearchType('basic')}
          >
            Basic Search
          </Button>

          <Button
            variant={searchType === 'fulltext' ? 'primary' : 'outline'}
            onClick={() => setSearchType('fulltext')}
          >
            Full-text Search
          </Button>

          <Button
            variant={searchType === 'autocomplete' ? 'primary' : 'outline'}
            onClick={() => setSearchType('autocomplete')}
          >
            Autocomplete
          </Button>
        </div>

        {/* Basic Search */}
        {searchType === 'basic' && (
          <form onSubmit={handleSubmit(handleBasicSearch)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Name" {...register('name')} placeholder="Platform name" />
              <Input label="Category" {...register('category')} placeholder="Platform category" />
              <Input label="Description" {...register('description')} placeholder="Platform description" />
            </div>

            {/* ✅ Client-side sorting controls (Basic only) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
              <div className="flex gap-3">
                <select
                  value={basicSortBy}
                  onChange={(e) => setBasicSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Client-side sort field"
                >
                  <option value="name">Sort by Name</option>
                  <option value="category">Sort by Category</option>
                  <option value="description">Sort by Description</option>

                  {/* Optional: enable only if your DTO has these fields */}
                  <option value="type">Sort by Type</option>
                  <option value="provider">Sort by Provider</option>
                  <option value="createdAt">Sort by Date</option>
                </select>

                <select
                  value={basicSortDirection}
                  onChange={(e) => setBasicSortDirection(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Client-side sort direction"
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
              </div>

              <Button type="submit" loading={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        )}

        {/* Full-text Search */}
        {searchType === 'fulltext' && (
          <form onSubmit={handleSubmit(handleFullTextSearch)} className="space-y-4">
            <input
              type="text"
              {...register('fulltext')}
              placeholder="Search across all platform data..."
              className="input input-bordered w-full"
            />
            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                <Search className="h-4 w-4 mr-2" />
                Full-text Search
              </Button>
            </div>
          </form>
        )}

        {/* Autocomplete Search */}
        {searchType === 'autocomplete' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search with Autocomplete
            </label>
            <PlatformAutocomplete onSelect={handleAutocompleteSelect} />
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              setResults([]);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Search Results ({results.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((platform) => (
              <PlatformCard key={platform.id} platform={platform} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && searchType && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSearch;
