import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, Fingerprint, MapPin, Building2, UserCog } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const LoginPage = ({ setRole, setZone }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('AUTHORITY');
    const [idNumber, setIdNumber] = useState('');
    const [password, setPassword] = useState('');
    const [selectedZone, setSelectedZone] = useState('North');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/api/auth/login', {
                email: idNumber,
                password,
                zone: selectedZone
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', user.role);
            localStorage.setItem('zone', user.zone);
            setRole(user.role);
            setZone(user.zone);
            toast.success('Authentication Successful');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Panel: Branding & Imagery */}
            <div className="hidden lg:flex lg:w-1/2 bg-ashoka relative text-white flex-col justify-between p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-ashoka to-blue-900 z-0"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-saffron/10 rounded-bl-full z-0 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-tr-full z-0 blur-3xl"></div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-ashoka font-black text-2xl">I</div>
                        <div>
                            <h1 className="font-black text-2xl tracking-widest uppercase">Incredible India</h1>
                            <p className="text-saffron font-bold text-xs uppercase tracking-[0.2em] mt-0.5">Ministry of Tourism</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
                        Urban Intelligence <br />& Predictive <span className="text-saffron">Safety</span>
                    </h2>
                    <p className="text-blue-200 text-lg max-w-md leading-relaxed border-l-4 border-saffron pl-4 font-medium">
                        The centralized national command node for monitoring geo-jurisdictions, capacity thresholds, and resolving high-tier security escalations.
                    </p>
                </div>

                <div className="relative z-10 border-t border-white/20 pt-6 flex justify-between items-center text-xs font-bold text-blue-300 uppercase tracking-widest">
                    <span>Secure Node: Active</span>
                    <span>Version 4.2.0 • 2026</span>
                </div>
            </div>

            {/* Right Panel: Login Flow */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-24 relative overflow-hidden">
                {/* Mobile Background Elements */}
                <div className="lg:hidden absolute top-0 w-full h-1.5 bg-gradient-to-r from-saffron via-orange-400 to-saffron left-0 z-10 shadow-sm"></div>

                <div className="w-full max-w-md space-y-8 relative z-10 bg-white p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
                    <div className="lg:hidden text-center mb-10 border-b border-gray-100 pb-6">
                        <h1 className="font-black text-2xl tracking-widest uppercase text-ashoka">Incredible India</h1>
                        <p className="text-saffron font-bold text-xs uppercase tracking-[0.2em] mt-1">Ministry of Tourism</p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-md transition-all ${activeTab === 'AUTHORITY' ? 'bg-white text-ashoka shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            onClick={() => setActiveTab('AUTHORITY')}
                        >
                            <Building2 className="w-4 h-4" /> Authority Login
                        </button>
                        <button
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-md transition-all ${activeTab === 'ADMINISTRATOR' ? 'bg-white text-saffron shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            onClick={() => setActiveTab('ADMINISTRATOR')}
                        >
                            <UserCog className="w-4 h-4" /> Administrator
                        </button>
                    </div>

                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                                 Official Email / Access ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Fingerprint className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 border-gray-300 rounded focus:ring-ashoka focus:border-ashoka p-3 sm:text-sm bg-gray-50 hover:bg-white transition-colors border"
                                     placeholder={activeTab === 'AUTHORITY' ? "e.g. zone@tms.gov.in" : "e.g. national@tms.gov.in"}
                                    value={idNumber}
                                    onChange={(e) => setIdNumber(e.target.value)}
                                />
                            </div>
                        </div>

                         <div>
                             <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                                 Secure Password
                             </label>
                             <div className="relative">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                     <KeyRound className="h-5 w-5 text-gray-400" />
                                 </div>
                                 <input
                                     type="password"
                                     required
                                     className="block w-full pl-10 border-gray-300 rounded focus:ring-ashoka focus:border-ashoka p-3 sm:text-sm bg-gray-50 hover:bg-white transition-colors border"
                                     placeholder="••••••••"
                                     value={password}
                                     onChange={(e) => setPassword(e.target.value)}
                                 />
                             </div>
                         </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                                Operational Region
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    className="block w-full pl-10 border-gray-300 rounded focus:ring-ashoka focus:border-ashoka p-3 sm:text-sm bg-gray-50 hover:bg-white transition-colors border appearance-none"
                                    value={selectedZone}
                                    onChange={(e) => setSelectedZone(e.target.value)}
                                >
                                    <option value="North">Northern Region (Delhi HQ)</option>
                                    <option value="West/Central">West/Central Region (Mumbai HQ)</option>
                                    <option value="South">Southern Region (Chennai HQ)</option>
                                    <option value="East">Eastern Region (Kolkata HQ)</option>
                                    <option value="North-East">North-East Region (Guwahati HQ)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded shadow-md text-sm font-black uppercase tracking-wider text-white ${activeTab === 'AUTHORITY' ? 'bg-ashoka hover:bg-[#000066] focus:ring-ashoka' : 'bg-saffron hover:bg-orange-600 focus:ring-saffron'} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${loading ? 'opacity-90' : ''}`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Verifying credentials with National Database...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Secure Login
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;
