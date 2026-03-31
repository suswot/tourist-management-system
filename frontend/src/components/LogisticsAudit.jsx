import React, { useState, useEffect } from 'react';
import { Building2, AlertTriangle, ShieldAlert, Navigation, Clock, ActivitySquare, Shield, Star, PhoneCall, Leaf, UserX, ChevronRight, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const LogisticsAudit = ({ role, zone, isFeedMode = false }) => {
    const [mismatches, setMismatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dispatchModal, setDispatchModal] = useState({ isOpen: false, mismatchId: null, touristName: '' });

    useEffect(() => {
        const fetchLogistics = async () => {
            try {
                const response = await api.get('/api/audit/logistics-mismatch');
                const formattedData = response.data.map((hotel) => ({
                    id: hotel._id,
                    tourist: hotel.touristId ? hotel.touristId.name : 'Unknown Tourist',
                    hotelName: hotel.hotelName,
                    district: hotel.location,
                    bookingSite: hotel.bookingSite,
                    alerts: hotel.securityAlerts || {},
                    riskScore: hotel.priorityData?.riskScore || 0,
                    is_VIP: hotel.priorityData?.is_VIP || false,
                    zone: hotel.priorityData?.zone || 'North',
                    Guide_ID: hotel.Guide_ID,
                    guideVerified: hotel.guideVerified
                }));
                // Sorting by risk score for the Intelligence Feed
                setMismatches(formattedData.sort((a, b) => b.riskScore - a.riskScore));
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchLogistics();
    }, [role, zone]);

    const triggerDispatchModal = (mismatchId, touristName) => {
        setDispatchModal({ isOpen: true, mismatchId, touristName });
    };

    const confirmDispatch = async () => {
        try {
            await api.post('/api/audit/actions/log', {
                actionType: 'Dispatch_Police',
                targetId: dispatchModal.mismatchId,
                targetModel: 'Hotel',
                details: `Autonomous police dispatch authorized for ${dispatchModal.touristName} through verified node credentials.`
            });
            await api.patch(`/api/audit/hotel/${dispatchModal.mismatchId}/resolve`);

            toast.success(`Tactical Unit Dispatched for ${dispatchModal.touristName}!`, { icon: '🚔' });
            setMismatches(prev => prev.filter(m => m.id !== dispatchModal.mismatchId));
            setDispatchModal({ isOpen: false, mismatchId: null, touristName: '' });
        } catch (error) { toast.error("Operational Log Update Failed"); }
    };

    const getAlertTag = (alerts) => {
        if (alerts.dateMismatch) return { label: 'LOGISTICS', color: 'bg-saffron text-white shadow-saffron/20 border-saffron/30' };
        if (alerts.capacityBreach) return { label: 'CAPACITY', color: 'bg-orange-500 text-white shadow-orange-500/20 border-orange-500/30' };
        if (alerts.safetyAnomaly) return { label: 'ANOMALY', color: 'bg-red-600 text-white shadow-red-600/20 border-red-600/30' };
        if (alerts.overstayEscalation) return { label: 'OVERSTAY', color: 'bg-purple-600 text-white shadow-purple-600/20 border-purple-600/30' };
        return null;
    };

    if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-20 bg-slate-100 rounded-2xl"></div>)}</div>;

    const displayedMismatches = mismatches;

    return (
        <div className="space-y-4">
            {displayedMismatches.map((m) => {
                const tag = getAlertTag(m.alerts);
                return (
                    <div 
                        key={m.id} 
                        onClick={() => triggerDispatchModal(m.id, m.tourist)}
                        className={`relative bg-white border border-slate-100 rounded-2xl transition-all cursor-pointer group hover:shadow-xl hover:shadow-ashoka/5 hover:border-ashoka/10 px-4 py-4 ${isFeedMode ? '' : 'flex items-center justify-between'}`}
                    >
                        {/* Risk Strip */}
                        <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${m.riskScore >= 90 ? 'bg-red-600' : m.riskScore >= 70 ? 'bg-saffron' : 'bg-ashoka/20'}`}></div>
                        
                        <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {tag && (
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${tag.color}`}>
                                        {tag.label}
                                    </span>
                                )}
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{m.riskScore}% THREAT</span>
                            </div>
                            <h4 className="text-sm font-black text-ashoka uppercase tracking-tight truncate group-hover:text-black transition-colors">{m.tourist}</h4>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] text-slate-400 font-bold truncate flex items-center gap-1.5 uppercase tracking-wide">
                                    <Building2 className="w-3.5 h-3.5 opacity-50" /> {m.hotelName}
                                </p>
                                <p className="text-[10px] text-slate-300 font-black flex items-center gap-1.5 uppercase tracking-wide border-l border-slate-100 pl-3">
                                    <Navigation className="w-3.5 h-3.5 opacity-50" /> {m.district}
                                </p>
                            </div>
                        </div>

                        {!isFeedMode && (
                             <div className="flex items-center gap-4 ml-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Access Node</p>
                                    <p className="text-xs font-black text-ashoka">{m.id.slice(-6).toUpperCase()}</p>
                                </div>
                                <button className="w-10 h-10 bg-ashoka text-white rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-all shadow-lg hover:shadow-red-600/30">
                                    <ShieldAlert className="w-5 h-5" />
                                </button>
                             </div>
                        )}
                        
                        {isFeedMode && (
                             <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-all">
                                <span className="text-[9px] font-black text-ashoka uppercase tracking-widest animate-pulse">Engage Node</span>
                                <ChevronRight className="w-4 h-4 text-ashoka transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </div>
                );
            })}

            {mismatches.length === 0 && (
                <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Active Logistics Anomalies in {zone || 'North'} Command</p>
                </div>
            )}

            {/* Emergency Dispatch Strategic Modal */}
            {dispatchModal.isOpen && (
                 <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-md">
                     <div className="bento-card max-w-sm w-full !p-0 shadow-2xl overflow-hidden scale-in border-none">
                        <div className="bg-red-600 p-6 text-center relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl animate-pulse"></div>
                             <ShieldAlert className="w-12 h-12 text-white mx-auto mb-4 animate-bounce" />
                             <h3 className="text-white font-black uppercase tracking-tighter text-lg leading-tight">Tactical Dispatch <br/> Authorization</h3>
                        </div>
                        <div className="p-8 space-y-6 bg-white">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Target Intelligence Entity</p>
                                <p className="text-lg font-black text-ashoka uppercase tracking-tight">{dispatchModal.touristName}</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                    <Info className="w-4 h-4 text-ashoka flex-shrink-0 mt-0.5" />
                                    <p className="text-[9px] font-bold text-ashoka uppercase tracking-wide leading-relaxed">
                                        Dispatch authorization will be logged and the mismatch will be resolved once approved.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setDispatchModal({ ...dispatchModal, isOpen: false })} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-ashoka transition-colors">Abort Node</button>
                                <button onClick={confirmDispatch} className="flex-1 btn-ashoka text-[10px] uppercase tracking-widest py-3 shadow-ashoka/30 hover:scale-105 active:scale-95 transition-all">Authorize Signal</button>
                            </div>
                        </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default LogisticsAudit;
