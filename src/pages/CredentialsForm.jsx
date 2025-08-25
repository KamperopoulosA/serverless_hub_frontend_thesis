import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Key, Save, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useUser } from '../context/UserContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';

const schema = yup.object({
    aws: yup.object({
        accessKeyId: yup.string(),
        secretAccessKey: yup.string(),
        region: yup.string()
    }),
    azure: yup.object({
        clientId: yup.string(),
        clientSecret: yup.string(),
        tenantId: yup.string()
    }),
    gcp: yup.object({
        projectId: yup.string(),
        keyFile: yup.string()
    })
});

const CredentialsForm = () => {
    const { updateCredentials } = useUser();
    const [saving, setSaving] = useState(false);
    const [showPasswords, setShowPasswords] = useState({});
    const [saveResult, setSaveResult] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            aws: { accessKeyId: '', secretAccessKey: '', region: 'us-east-1' },
            azure: { clientId: '', clientSecret: '', tenantId: '' },
            gcp: { projectId: '', keyFile: '' }
        }
    });

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const onSubmit = async (data) => {
        setSaving(true);
        setSaveResult(null);
        try {
            await api.post('/credentials', data);
            updateCredentials(data);
            setSaveResult({
                success: true,
                message: 'Credentials saved successfully!'
            });
        } catch (error) {
            console.error('Failed to save credentials:', error);
            setSaveResult({
                success: false,
                message: error.response?.data?.message || 'Failed to save credentials'
            });
        } finally {
            setSaving(false);
        }
    };

    const PasswordInput = ({ label, name, placeholder, ...props }) => (
        <div className="relative">
            <Input
                label={label}
                type={showPasswords[name] ? 'text' : 'password'}
                placeholder={placeholder}
                error={errors[name]?.message}
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
                <p className="text-gray-600 mt-2">Securely store your cloud platform credentials</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* AWS Credentials */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-6 h-6 bg-orange-500 rounded mr-2"></div>
                        AWS Credentials
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Access Key ID"
                            {...register('aws.accessKeyId')}
                            error={errors.aws?.accessKeyId?.message}
                            placeholder="AKIAIOSFODNN7EXAMPLE"
                        />
                        <PasswordInput
                            label="Secret Access Key"
                            name="aws.secretAccessKey"
                            {...register('aws.secretAccessKey')}
                            placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                        />
                    </div>
                    <div className="mt-4">
                        <Input
                            label="Default Region"
                            {...register('aws.region')}
                            error={errors.aws?.region?.message}
                            placeholder="us-east-1"
                        />
                    </div>
                </Card>

                {/* Azure Credentials */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-6 h-6 bg-blue-500 rounded mr-2"></div>
                        Azure Credentials
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Client ID"
                            {...register('azure.clientId')}
                            error={errors.azure?.clientId?.message}
                            placeholder="12345678-1234-1234-1234-123456789012"
                        />
                        <PasswordInput
                            label="Client Secret"
                            name="azure.clientSecret"
                            {...register('azure.clientSecret')}
                            placeholder="Your client secret"
                        />
                    </div>
                    <div className="mt-4">
                        <Input
                            label="Tenant ID"
                            {...register('azure.tenantId')}
                            error={errors.azure?.tenantId?.message}
                            placeholder="12345678-1234-1234-1234-123456789012"
                        />
                    </div>
                </Card>

                {/* GCP Credentials */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-6 h-6 bg-green-500 rounded mr-2"></div>
                        Google Cloud Credentials
                    </h2>
                    <div className="space-y-4">
                        <Input
                            label="Project ID"
                            {...register('gcp.projectId')}
                            error={errors.gcp?.projectId?.message}
                            placeholder="my-gcp-project"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Account Key (JSON)
                            </label>
                            <textarea
                                {...register('gcp.keyFile')}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                placeholder='{"type": "service_account", "project_id": "..."}'
                            />
                            {errors.gcp?.keyFile && (
                                <p className="mt-1 text-sm text-red-600">{errors.gcp.keyFile.message}</p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Save Result */}
                {saveResult && (
                    <div className={`p-4 rounded-lg ${
                        saveResult.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                    }`}>
                        <div className={`text-sm font-medium ${
                            saveResult.success ? 'text-emerald-800' : 'text-red-800'
                        }`}>
                            {saveResult.success ? 'Success!' : 'Error'}
                        </div>
                        <div className={`text-sm mt-1 ${
                            saveResult.success ? 'text-emerald-700' : 'text-red-700'
                        }`}>
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