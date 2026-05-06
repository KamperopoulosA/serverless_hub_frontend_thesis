import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AlertCircle, Rocket } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';

const schema = yup.object({
  functionName: yup.string().required('Function name is required'),
  platformId: yup.string().required('Platform is required'),
  functionPackageBase64: yup.string().required('Function package is required'),
  runtime: yup.string().nullable(),
  handler: yup.string().nullable(),
  region: yup.string().nullable(),
});

const ACTIVE_STATUSES = new Set(['QUEUED', 'RUNNING']);

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const cleanOptional = (value) => {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const getStatusMeta = (statusRaw) => {
  const status = (statusRaw || '').toUpperCase();

  if (status === 'SUCCESS') {
    return {
      panelClass: 'bg-emerald-50 border border-emerald-200',
      titleClass: 'text-emerald-800',
      bodyClass: 'text-emerald-700',
      title: 'Deployment Successful',
      message: 'Your function has been deployed successfully.',
    };
  }

  if (status === 'FAILED') {
    return {
      panelClass: 'bg-red-50 border border-red-200',
      titleClass: 'text-red-800',
      bodyClass: 'text-red-700',
      title: 'Deployment Failed',
      message: 'The deployment job failed. Check the error details below.',
    };
  }

  if (status === 'RUNNING') {
    return {
      panelClass: 'bg-blue-50 border border-blue-200',
      titleClass: 'text-blue-800',
      bodyClass: 'text-blue-700',
      title: 'Deployment Running',
      message: 'The worker has picked up the job and is deploying now.',
    };
  }

  return {
    panelClass: 'bg-amber-50 border border-amber-200',
    titleClass: 'text-amber-800',
    bodyClass: 'text-amber-700',
    title: 'Deployment Queued',
    message: 'The job was created successfully and is waiting for the worker.',
  };
};

const DeployFunctionForm = () => {
  const location = useLocation();
  const queryPlatformId = new URLSearchParams(location.search).get('platformId') || '';

  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(queryPlatformId);
  const [deploying, setDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      platformId: queryPlatformId,
      runtime: 'nodejs18.x',
      handler: 'index.handler',
      region: 'us-east-1',
    },
  });

  const currentBase64 = watch('functionPackageBase64');

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await api.get('/platforms');
        setPlatforms(response.data.content || response.data || []);
      } catch (error) {
        console.error('Failed to fetch platforms:', error);
      }
    };

    fetchPlatforms();
  }, []);

  useEffect(() => {
    if (!queryPlatformId) {
      return;
    }

    setSelectedPlatform(queryPlatformId);
    setValue('platformId', queryPlatformId);
  }, [queryPlatformId, setValue]);

  useEffect(() => {
    const deploymentId = deploymentResult?.deploymentId;
    const status = (deploymentResult?.status || '').toUpperCase();

    if (!deploymentId || !ACTIVE_STATUSES.has(status)) {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await api.get(`/deployments/${deploymentId}`);
        setDeploymentResult(response.data);
      } catch (error) {
        console.error('Failed to refresh deployment status:', error);
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [deploymentResult?.deploymentId, deploymentResult?.status]);

  const selected = platforms.find((platform) => platform.id === selectedPlatform);
  const provider = (selected?.provider || '').toUpperCase();
  const supported = provider === 'AWS' || provider === 'GCP';
  const statusMeta = deploymentResult ? getStatusMeta(deploymentResult.status) : null;

  const handleZipUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setDeploymentResult({
        status: 'FAILED',
        errorMessage: 'Please upload a .zip file.',
      });
      return;
    }

    try {
      const base64DataUrl = await fileToBase64(file);
      const payload = base64DataUrl.includes(',') ? base64DataUrl.split(',')[1] : base64DataUrl;
      setUploadedFileName(file.name);
      setValue('functionPackageBase64', payload, { shouldValidate: true });
      setDeploymentResult(null);
    } catch (error) {
      console.error('Failed to read zip file:', error);
      setDeploymentResult({
        status: 'FAILED',
        errorMessage: 'Failed to read the ZIP file. Please try again.',
      });
    }
  };

  const clearPackage = () => {
    setUploadedFileName('');
    setValue('functionPackageBase64', '', { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    if (!supported) {
      setDeploymentResult({
        status: 'FAILED',
        errorMessage: 'Deployments are only supported for AWS and GCP platforms.',
      });
      return;
    }

    setDeploying(true);
    setDeploymentResult(null);

    try {
      const payload = {
        platformId: data.platformId,
        functionName: data.functionName.trim(),
        functionPackageBase64: data.functionPackageBase64,
        runtime: cleanOptional(data.runtime),
        handler: cleanOptional(data.handler),
        region: cleanOptional(data.region),
      };

      const response = await api.post('/deployments', payload);
      setDeploymentResult(response.data);
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentResult({
        status: 'FAILED',
        errorMessage:
          error.response?.data?.message || 'Deployment failed due to an unexpected error.',
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

          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <select
              {...register('platformId')}
              value={selectedPlatform}
              onChange={(event) => {
                setSelectedPlatform(event.target.value);
                setValue('platformId', event.target.value, { shouldValidate: true });
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a platform</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name} ({platform.provider || 'Unknown'})
                </option>
              ))}
            </select>
            {errors.platformId && (
              <p className="text-red-600 text-sm mt-1">{errors.platformId.message}</p>
            )}
          </div>

          {!supported && selectedPlatform && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center">
              <AlertCircle className="text-yellow-600 mr-2" size={18} />
              <span className="text-sm text-yellow-700">
                Deployments are supported only for AWS and GCP at this time.
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Function Package (ZIP) <span className="text-gray-500">(recommended)</span>
            </label>

            <input
              type="file"
              accept=".zip,application/zip"
              onChange={handleZipUpload}
              className="w-full px-3 py-2 border rounded-lg"
            />

            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-600">
                {uploadedFileName ? `Selected: ${uploadedFileName}` : 'No file selected yet.'}
              </div>

              {(uploadedFileName || currentBase64) && (
                <button
                  type="button"
                  onClick={clearPackage}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Clear
                </button>
              )}
            </div>

            {errors.functionPackageBase64 && (
              <p className="text-red-600 text-sm mt-1">{errors.functionPackageBase64.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {showAdvanced ? 'Hide advanced Base64 input' : 'Show advanced Base64 input'}
            </button>

            {showAdvanced && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">
                  Function Package (Base64) <span className="text-gray-500">(advanced)</span>
                </label>
                <textarea
                  {...register('functionPackageBase64')}
                  rows={6}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste your base64 zip here"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If you upload a ZIP, this field is filled automatically.
                </p>
              </div>
            )}
          </div>

          <Input label="Runtime" {...register('runtime')} placeholder="nodejs18.x" />
          <Input label="Handler" {...register('handler')} placeholder="index.handler" />
          <Input label="Region" {...register('region')} placeholder="us-east-1" />

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={deploying} disabled={!supported}>
              <Rocket className="h-4 w-4 mr-2" />
              {deploying
                ? 'Creating Deployment Job...'
                : supported
                ? 'Deploy Function'
                : 'Deployment Not Supported'}
            </Button>
          </div>
        </form>

        {deploymentResult && statusMeta && (
          <div className={`mt-6 p-4 rounded-lg ${statusMeta.panelClass}`}>
            <div className={`font-medium ${statusMeta.titleClass}`}>{statusMeta.title}</div>
            <div className={`mt-1 ${statusMeta.bodyClass}`}>{statusMeta.message}</div>

            {deploymentResult.deploymentId && (
              <div className="mt-3 text-sm text-gray-700">
                <span className="font-medium">Deployment ID:</span> {deploymentResult.deploymentId}
              </div>
            )}

            {deploymentResult.endpointUrl && (
              <div className="mt-3">
                <a
                  href={deploymentResult.endpointUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View deployed function
                </a>
              </div>
            )}

            {deploymentResult.errorMessage && (
              <p className="mt-3 text-sm text-red-700">{deploymentResult.errorMessage}</p>
            )}

            {deploymentResult.logOutput && (
              <pre className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                {deploymentResult.logOutput}
              </pre>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DeployFunctionForm;
