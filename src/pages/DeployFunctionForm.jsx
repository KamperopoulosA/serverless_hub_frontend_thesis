import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Rocket, Code, Settings } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';

const schema = yup.object({
  functionName: yup.string().required('Function name is required'),
  platformId: yup.string().required('Platform is required'),
  userId: yup.string().required('User ID is required'),
  credentialsId: yup.string().required('Credentials ID is required'),
  functionPackageBase64: yup.string().required('Function package is required'),
  runtime: yup.string(),
  handler: yup.string(),
  region: yup.string(),
});

const DeployFunctionForm = () => {
  const [platforms, setPlatforms] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      runtime: 'nodejs18.x',
    },
  });

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await api.get('/platforms');
      setPlatforms(response.data.content || response.data);
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    }
  };

  const onSubmit = async (data) => {
    setDeploying(true);
    setDeploymentResult(null);
    try {
      const response = await api.post('/deployments', data);
      setDeploymentResult({
        success: true,
        message: response.data.message || 'Function deployed successfully!',
        data: response.data,
      });
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentResult({
        success: false,
        message: error.response?.data?.message || 'Deployment failed',
      });
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center mb-4">
        <Rocket className="h-8 w-8 mr-3 text-blue-600" />
        Deploy Serverless Function
      </h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Function Name"
            {...register('functionName')}
            error={errors.functionName?.message}
            placeholder="my-awesome-function"
          />

          <Input
            label="User ID"
            {...register('userId')}
            error={errors.userId?.message}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <select
              {...register('platformId')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a platform</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
            {errors.platformId && (
              <p className="text-red-600 text-sm mt-1">{errors.platformId.message}</p>
            )}
          </div>

          <Input
            label="Credentials ID"
            {...register('credentialsId')}
            error={errors.credentialsId?.message}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Function Package (Base64)</label>
            <textarea
              {...register('functionPackageBase64')}
              rows={6}
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your base64 zip here"
            />
            {errors.functionPackageBase64 && (
              <p className="text-red-600 text-sm mt-1">{errors.functionPackageBase64.message}</p>
            )}
          </div>

          <Input label="Runtime" {...register('runtime')} placeholder="nodejs18.x" />
          <Input label="Handler" {...register('handler')} placeholder="index.handler" />
          <Input label="Region" {...register('region')} placeholder="us-east-1" />

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={deploying}>
              <Rocket className="h-4 w-4 mr-2" />
              {deploying ? 'Deploying...' : 'Deploy Function'}
            </Button>
          </div>
        </form>

        {deploymentResult && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              deploymentResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className={`font-medium ${deploymentResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
              {deploymentResult.success ? 'Deployment Successful!' : 'Deployment Failed'}
            </div>
            <div className={`mt-1 ${deploymentResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
              {deploymentResult.message}
            </div>
            {deploymentResult.data?.endpointUrl && (
              <div className="mt-2">
                <a
                  href={deploymentResult.data.endpointUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View deployed function
                </a>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DeployFunctionForm;
