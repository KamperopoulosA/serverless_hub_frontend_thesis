import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Key, Save } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';

const schema = yup.object({
  awsAccessKeyId: yup.string(),
  awsSecretAccessKey: yup.string(),
  awsRegion: yup.string(),
  gcpServiceAccountJson: yup.string(),
});

const CredentialsForm = () => {
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [showPasswords, setShowPasswords] = useState({});
  const [saveResult, setSaveResult] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      awsAccessKeyId: '',
      awsSecretAccessKey: '',
      awsRegion: 'us-east-1',
      gcpServiceAccountJson: '',
    },
  });

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const [awsResponse, gcpResponse] = await Promise.allSettled([
          api.get('/credentials/AWS'),
          api.get('/credentials/GCP'),
        ]);

        const nextValues = {
          awsAccessKeyId: '',
          awsSecretAccessKey: '',
          awsRegion: 'us-east-1',
          gcpServiceAccountJson: '',
        };

        if (awsResponse.status === 'fulfilled') {
          const entries = awsResponse.value.data?.entries || {};
          nextValues.awsAccessKeyId = entries.AWS_ACCESS_KEY_ID || '';
          nextValues.awsSecretAccessKey = entries.AWS_SECRET_ACCESS_KEY || '';
          nextValues.awsRegion = entries.AWS_REGION || 'us-east-1';
        }

        if (gcpResponse.status === 'fulfilled') {
          const entries = gcpResponse.value.data?.entries || {};
          nextValues.gcpServiceAccountJson = entries.GCP_SERVICE_ACCOUNT_JSON || '';
        }

        reset(nextValues);
      } catch (error) {
        console.error('Failed to load saved credentials:', error);
      } finally {
        setLoadingExisting(false);
      }
    };

    loadCredentials();
  }, [reset]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({ ...previous, [field]: !previous[field] }));
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setSaveResult(null);

    const hasAwsAccessKey = !!data.awsAccessKeyId?.trim();
    const hasAwsSecret = !!data.awsSecretAccessKey?.trim();
    const hasGcpJson = !!data.gcpServiceAccountJson?.trim();

    if (hasAwsAccessKey !== hasAwsSecret) {
      setSaveResult({
        success: false,
        message: 'AWS credentials require both an access key ID and a secret access key.',
      });
      setSaving(false);
      return;
    }

    if (!hasAwsAccessKey && !hasAwsSecret && !hasGcpJson) {
      setSaveResult({
        success: false,
        message: 'Add AWS and/or GCP credentials before saving.',
      });
      setSaving(false);
      return;
    }

    try {
      const requests = [];

      if (hasAwsAccessKey && hasAwsSecret) {
        requests.push(
          api.put('/credentials/AWS', {
            entries: {
              AWS_ACCESS_KEY_ID: data.awsAccessKeyId.trim(),
              AWS_SECRET_ACCESS_KEY: data.awsSecretAccessKey.trim(),
              AWS_REGION: data.awsRegion?.trim() || 'us-east-1',
            },
          })
        );
      }

      if (hasGcpJson) {
        requests.push(
          api.put('/credentials/GCP', {
            entries: {
              GCP_SERVICE_ACCOUNT_JSON: data.gcpServiceAccountJson.trim(),
            },
          })
        );
      }

      await Promise.all(requests);

      setSaveResult({
        success: true,
        message: 'Credentials saved successfully.',
      });
    } catch (error) {
      console.error('Failed to save credentials:', error);
      setSaveResult({
        success: false,
        message: error.response?.data?.message || 'Failed to save credentials.',
      });
    } finally {
      setSaving(false);
    }
  };

  const PasswordInput = ({ label, name, error, placeholder, ...props }) => (
    <div className="relative">
      <Input
        label={label}
        type={showPasswords[name] ? 'text' : 'password'}
        placeholder={placeholder}
        error={error}
        {...props}
      />
      <button
        type="button"
        onClick={() => togglePasswordVisibility(name)}
        className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
      >
        {showPasswords[name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Key className="h-8 w-8 mr-3 text-blue-600" />
          Credentials Management
        </h1>
        <p className="text-gray-600 mt-2">Securely store AWS and GCP deployment credentials.</p>
      </div>

      {loadingExisting && (
        <div className="mb-4 text-sm text-gray-500">Loading saved credentials...</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-orange-500 rounded mr-2" />
            AWS Credentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Access Key ID"
              {...register('awsAccessKeyId')}
              error={errors.awsAccessKeyId?.message}
              placeholder="AKIAIOSFODNN7EXAMPLE"
            />
            <PasswordInput
              label="Secret Access Key"
              name="awsSecretAccessKey"
              error={errors.awsSecretAccessKey?.message}
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              {...register('awsSecretAccessKey')}
            />
          </div>
          <div className="mt-4">
            <Input
              label="Default Region"
              {...register('awsRegion')}
              error={errors.awsRegion?.message}
              placeholder="us-east-1"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-green-500 rounded mr-2" />
            Google Cloud Credentials
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Account JSON
            </label>
            <textarea
              {...register('gcpServiceAccountJson')}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"type":"service_account","project_id":"..."}'
            />
            {errors.gcpServiceAccountJson && (
              <p className="mt-1 text-sm text-red-600">{errors.gcpServiceAccountJson.message}</p>
            )}
          </div>
        </Card>

        {saveResult && (
          <div
            className={`p-4 rounded-lg ${
              saveResult.success
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div
              className={`text-sm font-medium ${
                saveResult.success ? 'text-emerald-800' : 'text-red-800'
              }`}
            >
              {saveResult.success ? 'Success' : 'Error'}
            </div>
            <div
              className={`text-sm mt-1 ${
                saveResult.success ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {saveResult.message}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save Credentials
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CredentialsForm;
