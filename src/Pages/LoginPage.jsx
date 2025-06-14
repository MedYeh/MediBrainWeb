import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, Loader2 } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await auth.login(email, password);
            navigate('/pages'); // Redirect to your main content page
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="flex justify-center items-center mb-6">
                    <BrainCircuit className="w-12 h-12 text-blue-600" />
                    <h1 className="text-4xl font-bold ml-3 text-gray-800">MediBrain</h1>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-center text-gray-700 mb-1">
                        Welcome Back
                    </h2>
                    <p className="text-center text-gray-500 mb-8">
                        Sign in to continue to your dashboard.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition"
                                required
                            />
                        </div>
                        
                        {error && (
                            <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center">
                                {error}
                            </p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin w-6 h-6" />
                                ) : (
                                    'Se Connecter'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* <p className="text-center text-gray-500 mt-8">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </p> */}
            </div>
        </div>
    );
};

export default LoginPage;