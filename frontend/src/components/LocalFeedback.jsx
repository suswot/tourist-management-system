import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { Bell, MapPin, AlertCircle, CheckCircle, Flame, MessageSquare, ChevronRight, Activity, Zap, Info } from 'lucide-react';

const MOCK_REPORTERS = ['Rahul Verma', 'Sneha Patel', 'Ankita Sharma', 'Vikram Singh', 'Priya Iyer', 'Karan Malhotra', 'Neha Gupta', 'Amit Kumar', 'Shruti Das', 'Sanjay Rao'];
const MOCK_LOCATIONS = ['Manali', 'Shimla', 'Delhi', 'Goa', 'Mumbai', 'Kochi', 'Jaipur', 'Udaipur', 'Gangtok', 'Puri'];
const MOCK_TYPES = ['Noise', 'Parking', 'Trash', 'Water Scarcity', 'Crowd Breach', 'Unauthorized Stall'];

const LocalFeedback = ({ zone, role, isCompact = false }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/api/audit/citizen-reports');
                
                // USER REQUEST: If no data or as a simulation, generate 10 randomized complaints every time
                if (response.data.length < 5) {
                    const simulatedData = Array.from({ length: 10 }).map((_, i) => ({
                        _id: `sim-${i}-${Math.random().toString(36).substr(2, 5)}`,
                        cityName: MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)],
                        zone: zone || 'North',
                        reportType: MOCK_TYPES[Math.floor(Math.random() * MOCK_TYPES.length)],
                        description: `Immediate resolution requested for ${MOCK_TYPES[Math.floor(Math.random() * MOCK_TYPES.length)].toLowerCase()} issue affecting local utility stress at this node.`,
                        status: Math.random() > 0.3 ? 'Pending' : 'Resolved',
                        reporterName: MOCK_REPORTERS[Math.floor(Math.random() * MOCK_REPORTERS.length)],
                        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
                    }));
                    setReports(simulatedData);
                } else {
                    setReports(response.data);
                }
            } catch (error) { 
                console.error('Failed to load local feedback, switching to Simulation Mode');
                // Fallback to simulation if backend fails
                const simulatedData = Array.from({ length: 10 }).map((_, i) => ({
                    _id: `sim-err-${i}`,
                    cityName: MOCK_LOCATIONS[i % MOCK_LOCATIONS.length],
                    zone: zone || 'North',
                    reportType: MOCK_TYPES[i % MOCK_TYPES.length],
                    description: `Critical resource monitoring alert: ${MOCK_TYPES[i % MOCK_TYPES.length]} escalation detected.`,
                    status: 'Pending',
                    reporterName: MOCK_REPORTERS[i % MOCK_REPORTERS.length],
                    createdAt: new Date().toISOString()
                }));
                setReports(simulatedData);
            } finally { setLoading(false); }
        };
        fetchReports();
    }, [zone, role]);

    const handleResolve = async (id) => {
        try {
            if (!id.startsWith('sim')) {
                await api.patch(`/api/audit/citizen-reports/${id}/resolve`);
            }
            toast.success('Simulation: Complaint Resolved & Logged');
            setReports(prev => prev.map(r => r._id === id ? { ...r, status: 'Resolved' } : r));
        } catch (error) { toast.error('Failed to resolve'); }
    };

    if (loading) return <div className="space-y-3 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl"></div>)}
    </div>;

    const pendingReports = reports.filter(r => r.status === 'Pending').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (isCompact) {
        return (
            <div className="space-y-4 animate-in fade-in duration-700">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black text-ashoka uppercase tracking-[0.2em] flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-saffron" /> Citizen Inbox
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-saffron rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pendingReports.length} Signals</span>
                    </div>
                </div>
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                    {pendingReports.map((report) => (
                        <div key={report._id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-ashoka/20 hover:shadow-xl hover:shadow-ashoka/5 transition-all transform hover:-translate-y-0.5 group flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[12px] shadow-sm border border-transparent group-hover:border-white/20 transition-all ${report.reportType === 'Noise' ? 'bg-purple-100 text-purple-700' : report.reportType === 'Parking' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                         {report.reportType.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black text-ashoka uppercase tracking-tighter leading-tight truncate w-32">{report.cityName}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight mt-0.5">{report.reportType}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleResolve(report._id)} className="w-8 h-8 bg-slate-50 hover:bg-ashoka text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all">
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed line-clamp-2 italic">
                                "{report.description}"
                            </p>
                        </div>
                    ))}
                    {pendingReports.length === 0 && (
                        <div className="text-center py-12">
                            <Zap className="w-10 h-10 text-emerald-400 mx-auto mb-4 opacity-50" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Operational Queue Cleared</p>
                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-2">No pending citizen reports in {zone} Sector</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between bg-ashoka/5 p-6 rounded-[2rem] border border-ashoka/10 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-ashoka rounded-2xl flex items-center justify-center text-white shadow-lg"><Activity className="w-6 h-6" /></div>
                    <div>
                        <h3 className="text-sm font-black text-ashoka uppercase tracking-widest leading-tight">National Outreach Monitor</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Live Citizen Intelligence Feed • Region: {zone}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-ashoka uppercase tracking-[0.2em] mb-1">Status: Operational</span>
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {reports.map((r) => (
                     <div key={r._id} className={`bento-card border-none shadow-xl shadow-ashoka/5 relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:scale-[1.02] ${r.status === 'Resolved' ? 'opacity-60 bg-slate-50' : 'bg-white'}`}>
                         <div className={`absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl opacity-10 ${r.reportType === 'Noise' ? 'bg-purple-600' : 'bg-orange-600'}`}></div>
                         
                         <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-ashoka/5 text-ashoka text-[9px] font-black uppercase rounded-lg tracking-widest border border-ashoka/10">{r.reportType}</span>
                                    {r.status === 'Pending' && <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase rounded-lg tracking-widest animate-pulse shadow-lg shadow-red-600/20">Critical</span>}
                                </div>
                                <MapPin className="w-4 h-4 text-ashoka/30 group-hover:text-ashoka transition-colors" />
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-lg font-black text-ashoka uppercase tracking-tight leading-tight">{r.cityName}</h4>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Reporter: {r.reporterName}</p>
                                </div>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-wide line-clamp-3 italic">
                                    "{r.description}"
                                </p>
                            </div>
                         </div>

                         <div className="mt-8 pt-6 border-t border-slate-50 relative z-10">
                            {r.status === 'Pending' ? (
                                <button 
                                    onClick={() => handleResolve(r._id)} 
                                    className="w-full py-3.5 bg-ashoka hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-ashoka/20 flex items-center justify-center gap-2 group"
                                >
                                    <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
                                    Deploy Resolution Node
                                </button>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                                    <CheckCircle className="w-4 h-4" /> Issue Neutralized
                                </div>
                            )}
                         </div>
                     </div>
                 ))}
            </div>

            <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-2xl"><Info className="w-6 h-6 text-saffron" /></div>
                <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Operational Protocol 26.A</h4>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                        Resolution of citizen reports directly impacts sector stability rankings. All deployments are analyzed for predictive threat modeling by the Central Intelligence Node.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LocalFeedback;
