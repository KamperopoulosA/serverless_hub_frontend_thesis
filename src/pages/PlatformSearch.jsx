import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Search, Filter, RefreshCw } from 'lucide-react';
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
    const { register, handleSubmit, reset, setValue, watch, control } = useForm();

    const handleBasicSearch = async (data) => {
    setLoading(true);
    try {
        const params = new URLSearchParams();
        Object.keys(data).forEach(key => {
            if (data[key]) params.append(key, data[key]);
        });

        const response = await api.get(`/platforms/search?${params}`);
        setResults(response.data.content || []); // ✅ Always use .content
    } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
    } finally {
        setLoading(false);
    }
};

   const handleAdvancedSearch = async (data) => {
    console.log("advancedSearch form data (raw):", data);

    // Convert empty strings to null
    const payload = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
            key,
            value === "" ? null : value
        ])
    );

    console.log("payload sent to backend:", payload);

    setLoading(true);
    try {
        const response = await api.post('/platforms/search', payload);
        setResults(response.data.content || []);
    } catch (error) {
        console.error('Advanced search failed:', error);
        setResults([]);
    } finally {
        setLoading(false);
    }
};


const handleFullTextSearch = async (data) => {
    try {
        // Prepare keyword and category filters
        const keyword = data.fulltext?.trim() || '';
        const categoricalFilters = data.categories || []; // ensure it's always an array

        // Build payload for backend
        const payload = {
            keyword,
            categoricalFilters,
            page: 0, // start from first page
            size: 10, // page size, can also be dynamic
            sortBy: 'name', // default sort field
            sortDirection: 'ASC', // default sort direction
        };

        console.log("Fulltext search payload:", payload);

        // Call backend
        const response = await api.post('/platforms/search/fulltext', payload);

        // Safely extract results
        const results = response.data?.content || [];
        setResults(results);

        console.log("Fulltext search results:", results);
    } catch (error) {
        console.error("Error performing fulltext search:", error);
    }
};

    const handleAutocompleteSelect = (platform) => {
        setResults([platform]);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/platforms/${id}`);
            setResults(prev => prev.filter(p => p.id !== id));
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
                        variant={searchType === 'advanced' ? 'primary' : 'outline'}
                        onClick={() => setSearchType('advanced')}
                    >
                        Advanced Search
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
                            <Input
  label="Keyword"
  {...register('keyword')} // maps to request.getKeyword()
  placeholder="Search all fields..."
/>

<Input
  label="Name"
  {...register('name')} // maps to request.getName()
  placeholder="Platform name"
/>

<Input
  label="Category"
  {...register('category')} // maps to request.getCategory()
  placeholder="Platform category"
/>

<Input
  label="Description"
  {...register('description')} // maps to request.getDescription()
  placeholder="Platform description"
/>

<select {...register('sortBy')}>
  <option value="name">Name</option>
  <option value="category">Category</option>
  <option value="description">Description</option>
</select>

<select {...register('sortDirection')}>
  <option value="ASC">Ascending</option>
  <option value="DESC">Descending</option>
</select>

<Input {...register('page')} type="number" placeholder="Page number" />
<Input {...register('size')} type="number" placeholder="Page size" />

                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" loading={loading}>
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </form>
                )}

                {/* Advanced Search */}
              {searchType === 'advanced' && (
  <form onSubmit={handleSubmit(handleAdvancedSearch)} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Controller
        name="keyword"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input {...field} label="Keyword" placeholder="Search all fields..." />
        )}
      />
      <Controller
        name="name"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input {...field} label="Name" placeholder="Platform name" />
        )}
      />
      <Controller
        name="category"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input {...field} label="Category" placeholder="Platform category" />
        )}
      />
      <Controller
        name="description"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input {...field} label="Description" placeholder="Platform description" />
        )}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <Controller
        name="sortBy"
        control={control}
        defaultValue="name"
        render={({ field }) => (
          <select {...field} className="px-3 py-2 border rounded">
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="description">Description</option>
          </select>
        )}
      />
      <Controller
        name="sortDirection"
        control={control}
        defaultValue="ASC"
        render={({ field }) => (
          <select {...field} className="px-3 py-2 border rounded">
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        )}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <Controller
        name="page"
        control={control}
        defaultValue={0}
        render={({ field }) => <Input {...field} type="number" placeholder="Page number" />}
      />
      <Controller
        name="size"
        control={control}
        defaultValue={10}
        render={({ field }) => <Input {...field} type="number" placeholder="Page size" />}
      />
    </div>

    <div className="flex justify-end mt-4">
      <Button type="submit" loading={loading}>
        <Filter className="h-4 w-4 mr-2" />
        Advanced Search
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
                            <PlatformCard
                                key={platform.id}
                                platform={platform}
                                onDelete={handleDelete}
                            />  
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