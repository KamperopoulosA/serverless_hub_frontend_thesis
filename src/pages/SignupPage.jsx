import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';

const schema = yup.object({
    username: yup.string().required('Username is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const SignupPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/signup', data);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card className="p-8">
                <div className="text-center mb-8">
                    <UserPlus className="h-12 w-12 mx-auto text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900 mt-4">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join us and start managing your platforms.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Username"
                        {...register('username')}
                        error={errors.username?.message}
                        placeholder="yourusername"
                    />
                    <Input
                        label="Email"
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                        placeholder="you@example.com"
                    />
                    <Input
                        label="Password"
                        type="password"
                        {...register('password')}
                        error={errors.password?.message}
                        placeholder="••••••••"
                    />

                    {error && (
                        <div className="text-red-600 text-sm text-center">{error}</div>
                    )}

                    <Button type="submit" loading={loading} className="w-full">
                        Sign Up
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Log In
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default SignupPage;
