import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSearchParams } from 'react-router-dom';
import { Rocket, Code, Settings } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';

const schema = yup.object({
    functionName: yup.string().required('Function name is required'),
    platformId: yup.string().required('Platform is required'),
    runtime: yup.string().required('Runtime is required'),
    code: yup.string().required('Function code is required'),
    environment: yup.object(),
});

const DeployFunctionForm = () => {
    const [searchParams] = useSearchParams();
    const [platforms, setPlatforms] = useState([]);
    const [deploying, setDeploying] = useState(false);
    const [deploymentResult, setDeploymentResult] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            platformId: searchParams.get('platformId') || '',
            runtime: 'nodejs18.x',
            environment: {}
        }
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
                data: response.data
            });
        } catch (error) {
            console.error('Deployment failed:', error);
            setDeploymentResult({
                success: false,
                message: error.response?.data?.message || 'Deployment failed'
            });
        } finally {
            setDeploying(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Rocket className="h-8 w-8 mr-3 text-blue-600" />
                    Deploy Serverless Function
                </h1>
                <p className="text-gray-600 mt-2">Deploy your function to a selected platform</p>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Configuration */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Settings className="h-5 w-5 mr-2" />
                            Basic Configuration
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Function Name"
                                {...register('functionName')}
                                error={errors.functionName?.message}
                                placeholder="my-awesome-function"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Target Platform
                                </label>
                                <select
                                    {...register('platformId')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a platform</option>
                                    {platforms.map(platform => (
                                        <option key={platform.id} value={platform.id}>
                                            {platform.name} ({platform.type})
                                        </option>
                                    ))}
                                </select>
                                {errors.platformId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.platformId.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Runtime
                            </label>
                            <select
                                {...register('runtime')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="nodejs18.x">Node.js 18.x</option>
                                <option value="nodejs16.x">Node.js 16.x</option>
                                <option value="python3.9">Python 3.9</option>
                                <option value="python3.10">Python 3.10</option>
                                <option value="java11">Java 11</option>
                                <option value="dotnet6">. NET 6</option>
                            </select>
                        </div>
                    </div>

                    {/* Function Code */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Code className="h-5 w-5 mr-2" />
                            Function Code
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Source Code
                            </label>
                            <textarea
                                {...register('code')}
                                rows={12}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                placeholder="exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello World!' })
    };
};"
                            />
                            {errors.code && (
                                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Environment Variables */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment Variables</h2>
                        <textarea
                            {...register('environment')}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            placeholder='{"NODE_ENV": "production", "API_KEY": "your-api-key"}'
                        />
                        <p className="text-sm text-gray-500 mt-1">JSON format for environment variables</p>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <Button type="submit" loading={deploying} className="min-w-32">
                            <Rocket className="h-4 w-4 mr-2" />
                            {deploying ? 'Deploying...' : 'Deploy Function'}
                        </Button>
                    </div>
                </form>

                {/* Deployment Result */}
                {deploymentResult && (
                    <div className={`mt-6 p-4 rounded-lg ${
                        deploymentResult.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                    }`}>
                        <div className={`text-sm font-medium ${
                            deploymentResult.success ? 'text-emerald-800' : 'text-red-800'
                        }`}>
                            {deploymentResult.success ? 'Deployment Successful!' : 'Deployment Failed'}
                        </div>
                        <div className={`text-sm mt-1 ${
                            deploymentResult.success ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                            {deploymentResult.message}
                        </div>
                        {deploymentResult.data?.functionUrl && (
                            <div className="mt-2">
                                <a
                                    href={deploymentResult.data.functionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm underline"
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