import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Rocket, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';
import { useNavigate } from 'react-router-dom'; // REDIRECT

const schema = yup.object({
  functionName: yup.string().required('Function name is required'),
  platformId: yup.string().required('Platform is required'),
  userId: yup.string(),
  credentialsId: yup.string(),
  functionPackageBase64: yup.string().required('Function package is required'), // stays required
  runtime: yup.string(),
  handler: yup.string(),
  region: yup.string(),
});

// Helper: File -> Base64 (Data URL)
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data:application/zip;base64,XXXX
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const DeployFunctionForm = () => {
  const navigate = useNavigate(); // REDIRECT
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);

  // UI states for upload + advanced
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
      runtime: 'nodejs18.x',
    },
  });

  // (optional) watch base64 field to decide UI
  const currentBase64 = watch('functionPackageBase64');

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

  // Αν επιλέξει AWS -> αυτόματες τιμές & απόκρυψη πεδίων
  useEffect(() => {
    const selected = platforms.find((p) => p.id === selectedPlatform);
    if (selected && selected.name?.toLowerCase().includes('aws')) {
      setValue('userId', '22222222-2222-2222-2222-222222222222');
      setValue('credentialsId', 'a531dff9-e36c-413b-a431-f19053e1cb34');
    } else {
      setValue('userId', '');
      setValue('credentialsId', '');
    }
  }, [selectedPlatform, platforms, setValue]);

  const handleZipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic guard (optional)
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setDeploymentResult({
        success: false,
        message: '❌ Please upload a .zip file.',
      });
      return;
    }

    try {
      setDeploymentResult(null);

      const base64DataUrl = await fileToBase64(file);
      const payload = base64DataUrl.includes(',')
        ? base64DataUrl.split(',')[1]
        : base64DataUrl;

      setUploadedFileName(file.name);
      setValue('functionPackageBase64', payload, { shouldValidate: true });

      // κρατάμε το textarea ως advanced option -> δεν το ανοίγουμε αναγκαστικά
      // setShowAdvanced(false);
    } catch (err) {
      console.error('Failed to read zip file:', err);
      setDeploymentResult({
        success: false,
        message: '❌ Failed to read the ZIP file. Please try again.',
      });
    }
  };

  const clearPackage = () => {
    setUploadedFileName('');
    setValue('functionPackageBase64', '', { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    const selected = platforms.find((p) => p.id === selectedPlatform);
    const name = selected?.name?.toLowerCase() || '';

    // Επιτρέπεται deploy μόνο για AWS ή GCP
    if (!name.includes('aws') && !name.includes('gcp')) {
      setDeploymentResult({
        success: false,
        message: '❌ Deployment is only supported for AWS and GCP platforms.',
      });
      return;
    }

    setDeploying(true);
    setDeploymentResult(null);

    try {
      const response = await api.post('/deployments', data);
      const status = response.data.deploymentStatus || response.data.status || '';
      const isSuccess = status.toUpperCase() === 'SUCCESS';

      setDeploymentResult({
        success: isSuccess,
        message:
          response.data.message ||
          (isSuccess
            ? '✅ Function deployed successfully!'
            : '❌ Deployment failed. Check logs for details.'),
        data: response.data,
      });
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentResult({
        success: false,
        message:
          error.response?.data?.message ||
          '❌ Deployment failed due to an unexpected error.',
      });
    } finally {
      setDeploying(false);
       // REDIRECT (success ή fail)
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    }
  };

  const selected = platforms.find((p) => p.id === selectedPlatform);
  const platformName = selected?.name?.toLowerCase() || '';
  const isAWS = platformName.includes('aws');
  const isGCP = platformName.includes('gcp');
  const supported = isAWS || isGCP;

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

          {/* Επιλογή πλατφόρμας */}
          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <select
              {...register('platformId')}
              onChange={(e) => setSelectedPlatform(e.target.value)}
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

          {/* Ενημερωτικό μήνυμα για μη υποστηριζόμενη πλατφόρμα */}
          {!supported && selectedPlatform && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center">
              <AlertCircle className="text-yellow-600 mr-2" size={18} />
              <span className="text-sm text-yellow-700">
                Deployments are supported only for AWS and GCP at this time.
              </span>
            </div>
          )}

          {/* Απόκρυψη User ID & Credentials ID μόνο για AWS */}
          {!isAWS && (
            <>
              <Input
                label="User ID"
                {...register('userId')}
                error={errors.userId?.message}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />

              <Input
                label="Credentials ID"
                {...register('credentialsId')}
                error={errors.credentialsId?.message}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </>
          )}

          {/* ✅ ZIP upload (recommended) */}
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
                {uploadedFileName
                  ? `Selected: ${uploadedFileName}`
                  : 'No file selected yet.'}
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
              <p className="text-red-600 text-sm mt-1">
                {errors.functionPackageBase64.message}
              </p>
            )}
          </div>

          {/* ✅ Advanced option: Base64 textarea (toggle) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
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
                  If you uploaded a ZIP, this field is filled automatically.
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
                ? 'Deploying...'
                : supported
                ? 'Deploy Function'
                : 'Deployment Not Supported'}
            </Button>
          </div>
        </form>

        {deploymentResult && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              deploymentResult.success
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div
              className={`font-medium ${
                deploymentResult.success ? 'text-emerald-800' : 'text-red-800'
              }`}
            >
              {deploymentResult.success
                ? '✅ Deployment Successful!'
                : '❌ Deployment Failed'}
            </div>

            <div
              className={`mt-1 ${
                deploymentResult.success ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {deploymentResult.message}
            </div>

            {deploymentResult.success && deploymentResult.data?.endpointUrl && (
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
