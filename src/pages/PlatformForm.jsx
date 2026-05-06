import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';
import useAuth from '../hooks/useAuth';

const schema = yup.object({
  name: yup.string().required('Platform name is required'),
  category: yup.string().required('Platform category is required'),
  provider: yup.string().required('Platform provider is required'),
  description: yup.string(),
  featuresJson: yup
    .string()
    .required('Features JSON is required')
    .test('is-json', 'Invalid JSON format', (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }),
});

const PlatformForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      category: '',
      provider: 'AWS',
      description: '',
      featuresJson: JSON.stringify(
        { runtime: '', region: '', scaling: '', maxTimeout: '', memory: '' },
        null,
        2
      ),
    },
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    if (!isEdit) {
      setInitialLoading(false);
      return;
    }

    let isMounted = true;

    const fetchPlatform = async () => {
      try {
        const { data } = await api.get(`/platforms/${id}`);
        if (!isMounted) {
          return;
        }

        reset({
          name: data.name || '',
          category: data.category || '',
          provider: data.provider || 'AWS',
          description: data.description || '',
          featuresJson: JSON.stringify(data.featuresJson || {}, null, 2),
        });
      } catch (error) {
        console.error('Failed to fetch platform:', error);
        if (isMounted) {
          setFetchError('Failed to fetch platform details.');
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    fetchPlatform();

    return () => {
      isMounted = false;
    };
  }, [id, isAdmin, isEdit, navigate, reset]);

  const onSubmit = async (data) => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: data.name.trim(),
        category: data.category.trim(),
        provider: data.provider,
        description: data.description?.trim() || '',
        featuresJson: JSON.parse(data.featuresJson),
      };

      if (isEdit) {
        await api.put(`/platforms/${id}`, payload);
      } else {
        await api.post('/platforms', payload);
      }

      navigate('/');
    } catch (error) {
      console.error('Failed to save platform:', error);
      alert(error.response?.data?.message || 'Failed to save platform.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <Button variant="outline" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Platform' : 'Create Platform'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEdit ? 'Update platform configuration' : 'Add a new platform to your infrastructure'}
          </p>
          {fetchError && <p className="mt-2 text-sm text-red-600">{fetchError}</p>}
        </div>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Platform Name"
              placeholder="e.g., AWS Lambda"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Category"
              placeholder="e.g., FaaS"
              {...register('category')}
              error={errors.category?.message}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select
                {...register('provider')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AWS">AWS</option>
                <option value="GCP">GCP</option>
              </select>
              {errors.provider && (
                <p className="mt-1 text-sm text-red-600">{errors.provider.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Describe this platform and its capabilities..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features JSON</label>
            <textarea
              {...register('featuresJson')}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder='e.g., {"memory": "512MB", "runtime": "nodejs18"}'
            />
            {errors.featuresJson && (
              <p className="mt-1 text-sm text-red-600">{errors.featuresJson.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Platform' : 'Create Platform'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PlatformForm;
