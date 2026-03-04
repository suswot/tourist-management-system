import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, User, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const IdentityVerificationHub = ({ touristsOverride, role, zone }) => {
    const [tourists, setTourists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTourist, setSelectedTourist] = useState(null);

    useEffect(() => {
        if (touristsOverride) {
            setTourists(touristsOverride);
            setLoading(false);
        } else {
            const fetchTourists = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/audit/tourists');
                    const formattedData = response.data.map(t => ({
                        id: t._id,
                        name: t.name,
                        aadhaar: t.aadhaarNumber,
                        passport: t.passportNumber,
                        status: t.verificationStatus,
                        circuit: t.circuitId ? t.circuitId.name : 'Unknown Circuit'
                    }));
                    setTourists(formattedData);
                } catch (error) {
                    console.error('Error fetching tourists:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchTourists();
        }
    }, [touristsOverride]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Verified': return <ShieldCheck className="w-5 h-5 text-green-500" />;
            case 'Rejected': return <ShieldAlert className="w-5 h-5 text-red-500" />;
            default: return <Shield className="w-5 h-5 text-saffron" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Verified': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-orange-100 text-orange-800';
        }
    };

    const handleReview = (tourist) => {
        setSelectedTourist(tourist);
    };

    const handleStatusUpdate = async (touristId, status) => {
        try {
            await axios.patch(`http://localhost:5000/api/audit/tourist/${touristId}/verify`, { status }, {
                headers: { role, zone }
            });
            setTourists(prev => prev.map(t => t.id === touristId ? { ...t, status } : t));
            setSelectedTourist(prev => ({ ...prev, status }));
            toast.success(`Tourist Identity ${status}`);

            if (status === 'Verified') {
                setTimeout(() => setSelectedTourist(null), 1000);
            }
        } catch (error) {
            console.error(error);
            toast.error("Validation update failed");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="border-b border-gray-100 p-5 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-ashoka flex items-center gap-2">
                    <User className="w-5 h-5 text-saffron" />
                    Identity Verification Hub
                </h2>
                <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    {tourists.length} Audits
                </span>
            </div>

            <div className="p-0">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex space-x-4 border-b border-gray-50 pb-4">
                                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Tourist</th>
                                    <th className="px-6 py-3">ID Document</th>
                                    <th className="px-6 py-3">Circuit</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tourists.map((t) => (
                                    <tr key={t.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {t.aadhaar ? `Aadhaar: ${t.aadhaar}` : t.passport ? `Passport: ${t.passport}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{t.circuit}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-max gap-1.5 ${getStatusBadge(t.status)}`}>
                                                {getStatusIcon(t.status)}
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleReview(t)}
                                                className="text-ashoka hover:text-saffron font-medium text-sm transition-colors"
                                            >
                                                {t.status === 'Verified' ? 'View' : 'Review'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tourist Details Modal */}
            {selectedTourist && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-ashoka flex items-center gap-2">
                                <User className="w-5 h-5 text-saffron" />
                                KYC Document Verification
                            </h3>
                            <button onClick={() => setSelectedTourist(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 text-xs text-center p-2 relative overflow-hidden">
                                    <div className="absolute inset-x-0 top-0 h-4 bg-blue-100"></div>
                                    <User className="w-8 h-8 text-gray-400 mb-1 z-10" />
                                    <span className="z-10 font-medium">Verified Source</span>
                                    <span className="z-10 mt-1">{selectedTourist.aadhaar ? 'Aadhaar Card' : 'Passport'}</span>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <p className="text-sm font-semibold text-gray-900 flex justify-between items-center border-b border-gray-100 pb-1">
                                        Name: <span className="font-normal text-gray-600">{selectedTourist.name}</span>
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 flex justify-between items-center border-b border-gray-100 pb-1">
                                        ID Number: <span className="font-normal text-gray-600 font-mono tracking-tight">{selectedTourist.aadhaar || selectedTourist.passport}</span>
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 flex justify-between items-center border-b border-gray-100 pb-1">
                                        Circuit: <span className="font-normal text-gray-600">{selectedTourist.circuit}</span>
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 flex justify-between items-center border-b border-gray-100 pb-1">
                                        Status:
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadge(selectedTourist.status)}`}>
                                            {selectedTourist.status}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {selectedTourist.status !== 'Verified' ? (
                                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedTourist.id, 'Verified')}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-1"
                                    >
                                        <ShieldCheck className="w-4 h-4" /> Approve Identity
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedTourist.id, 'Rejected')}
                                        className="flex-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 py-2 rounded-md font-medium text-sm transition-colors"
                                    >
                                        Reject Issue
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 border-t border-gray-100 text-center">
                                    <p className="text-xs font-semibold text-green-600 bg-green-50 p-2 rounded-lg inline-flex items-center gap-1 border border-green-100">
                                        <ShieldCheck className="w-4 h-4" /> This profile has already passed KYC verification.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdentityVerificationHub;
