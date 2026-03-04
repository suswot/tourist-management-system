import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Bell, MapPin, AlertCircle, CheckCircle, Flame, MessageSquare } from 'lucide-react';

const LocalFeedback = ({ zone, role }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/audit/citizen-reports?zone=${encodeURIComponent(zone || 'North')}`, {
                    headers: { role, zone }
                });
                setReports(response.data);
            } catch (error) {
                console.error('Error fetching citizen reports', error);
                toast.error('Failed to load local feedback');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [zone, role]);

    const handleResolve = async (id) => {
        try {
            await axios.patch(`http://localhost:5000/api/audit/citizen-reports/${id}/resolve`, {}, {
                headers: { role, zone }
            });
            toast.success('Complaint Resolved & Hotel Notified');
            setReports(prev => prev.map(r => r._id === id ? { ...r, status: 'Resolved' } : r));
        } catch (error) {
            toast.error('Failed to resolve complaint');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 animate-pulse">
                <Bell className="w-12 h-12 text-ashoka opacity-50 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Community Feedback...</p>
            </div>
        );
    }

    const pendingCount = reports.filter(r => r.status === 'Pending').length;

    return (
        <div className="bg-gray-50 border-[3px] border-gray-200 rounded-none shadow-xl p-4 sm:p-6 w-full max-w-4xl mx-auto space-y-6">
            <div className="border-b-[3px] border-gray-300 pb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-wider">
                        <MessageSquare className="w-7 h-7 text-ashoka" />
                        Citizen Inbox
                    </h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                        Community Integrity Reports — {zone || 'North'} Region
                    </p>
                </div>
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 bg-saffron text-white px-4 py-2 font-black text-sm uppercase shadow-sm border border-orange-600 rounded">
                        <Bell className="w-5 h-5 animate-wiggle" /> {pendingCount} Pending
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 text-center py-10 bg-white border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 font-bold uppercase">No community feedback for this jurisdiction.</p>
                    </div>
                ) : (
                    reports.map(report => (
                        <div key={report._id} className={`p-4 rounded-none border-l-4 shadow-sm bg-white relative transition-colors ${report.status === 'Pending' ? 'border-saffron border-y border-r border-orange-200' : 'border-emerald-500 border-y border-r border-gray-200 opacity-70'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${report.reportType === 'Noise' ? 'bg-purple-100 text-purple-700' : report.reportType === 'Parking' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {report.reportType}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${report.status === 'Resolved' ? 'text-emerald-600' : 'text-saffron'}`}>
                                    {report.status === 'Resolved' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                    {report.status}
                                </span>
                            </div>

                            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1 mt-1 mb-2">
                                <MapPin className="w-4 h-4 text-ashoka" /> {report.cityName}
                            </h3>

                            <p className="text-xs text-gray-700 font-semibold leading-relaxed mb-4">{report.description}</p>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 capitalize">By: {report.reporterName}</span>

                                {report.status === 'Pending' && (['Zone_Manager', 'Regional_Admin', 'National_Admin'].includes(role)) && (
                                    <button
                                        onClick={() => handleResolve(report._id)}
                                        className="bg-ashoka hover:bg-[#000066] text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                                    >
                                        Resolve & Notify Hotel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LocalFeedback;
