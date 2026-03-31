import React, { useState, useEffect, useMemo } from 'react';
import { Shield, ShieldAlert, ShieldCheck, User, X, ChevronRight, Fingerprint, Search, Filter, Database, AlertCircle, Info, History } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const IdentityVerificationHub = ({ touristsOverride, role, zone, isCompact: initialIsCompact = false, searchTermOverride = '', selectedTouristOverride = null, onClearSelection = () => {} }) => {
    const [tourists, setTourists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTourist, setSelectedTourist] = useState(null);
    const [showFullDatabase, setShowFullDatabase] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const searchTerm = searchTermOverride || localSearchTerm;

    useEffect(() => {
        if (touristsOverride) {
            setTourists(touristsOverride);
            setLoading(false);
        } else {
            const fetchTourists = async () => {
                try {
                    const response = await api.get('/api/audit/tourists');
                    setTourists(response.data.map(t => ({
                        id: t._id,
                        name: t.name,
                        aadhaar: t.aadhaarNumber,
                        passport: t.passportNumber,
                        status: t.verificationStatus,
                        circuit: t.circuitId ? t.circuitId.name : 'Unknown Circuit'
                    })));
                } catch (error) { console.error(error); } finally { setLoading(false); }
            };
            fetchTourists();
        }
    }, [touristsOverride, role, zone]);

    // Lifted selection from global search
    useEffect(() => {
        if (selectedTouristOverride) {
            setSelectedTourist(selectedTouristOverride);
        }
    }, [selectedTouristOverride]);

    const filteredTourists = useMemo(() => {
        return tourists.filter(t => {
            const matchesSearch = (
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.aadhaar && t.aadhaar.includes(searchTerm)) ||
                (t.passport && t.passport.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            const matchesStatus = statusFilter === 'ALL' || t.status.toUpperCase() === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tourists, searchTerm, statusFilter]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Verified': return 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.05)]';
            case 'Rejected': return 'bg-red-50 text-red-700 border-red-100 shadow-[0_0_10px_rgba(220,38,38,0.05)]';
            default: return 'bg-orange-50 text-orange-700 border-orange-100 shadow-[0_0_10px_rgba(249,115,22,0.05)]';
        }
    };

    const handleReview = (tourist) => setSelectedTourist(tourist);

    const handleStatusUpdate = async (touristId, status) => {
        try {
            await api.patch(`/api/audit/tourist/${touristId}/verify`, { status });
            setTourists(prev => prev.map(t => t.id === touristId ? { ...t, status } : t));
            toast.success(`Identity Verified: Node Updated`);
            if (status === 'Verified') setTimeout(() => {
                setSelectedTourist(null);
                onClearSelection();
            }, 800);
        } catch (error) { toast.error("Validation update failed"); }
    };

    const closeModal = () => {
        setSelectedTourist(null);
        onClearSelection();
    };

    if (loading) return <div className="animate-pulse h-48 bg-slate-100 rounded-3xl border border-slate-50"></div>;

    if (initialIsCompact && !showFullDatabase) {
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-ashoka uppercase tracking-[0.2em] flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-saffron" /> Verification Hub
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredTourists.length} Matches</span>
                    </div>
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-ashoka transition-colors" />
                    <input 
                        type="text" 
                        placeholder={searchTermOverride ? "Universal Filtering Active" : "Quick UID Search..."}
                        readOnly={!!searchTermOverride}
                        value={searchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                        className={`w-full ${searchTermOverride ? 'bg-ashoka/5 border-ashoka/10 italic' : 'bg-slate-50/50 border-slate-100'} border rounded-xl py-2 pl-8 pr-4 text-[10px] font-bold focus:border-ashoka/20 outline-none transition-all`}
                    />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 flex flex-col custom-scrollbar">
                    {filteredTourists.slice(0, 8).map((t) => (
                        <div key={t.id} onClick={() => handleReview(t)} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-ashoka/10 hover:shadow-lg hover:shadow-ashoka/5 transition-all cursor-pointer group">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-ashoka/5 flex items-center justify-center font-black text-ashoka text-[10px] group-hover:bg-ashoka group-hover:text-white transition-colors duration-300">
                                     {t.name.charAt(0)}
                                 </div>
                                 <div className="min-w-0">
                                     <p className="text-[11px] font-black text-ashoka uppercase tracking-tight leading-tight truncate w-32">{t.name}</p>
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">{t.aadhaar || t.passport || 'NO_ID'}</p>
                                 </div>
                             </div>
                             <div className={`status-badge !p-1 !rounded-lg ${getStatusStyles(t.status)}`}>
                                 {t.status === 'Verified' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                             </div>
                        </div>
                    ))}
                    {filteredTourists.length === 0 && (
                        <div className="text-center py-6 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">No matching identity records found</div>
                    )}
                </div>
                
                <button 
                    onClick={() => setShowFullDatabase(true)}
                    className="w-full py-2.5 text-[10px] font-black text-ashoka uppercase tracking-[0.2em] hover:text-saffron transition-all border-t border-slate-50 mt-2 flex items-center justify-center gap-2 group"
                >
                    <Database className="w-3.5 h-3.5 group-hover:animate-bounce" /> Explore Verification Database
                </button>
                {selectedTourist && <TouristDetailModal selectedTourist={selectedTourist} setSelectedTourist={closeModal} handleStatusUpdate={handleStatusUpdate} getStatusStyles={getStatusStyles} role={role} zone={zone} />}
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${showFullDatabase ? 'fixed inset-0 bg-white z-[70] p-6 lg:p-12 overflow-y-auto animate-in fade-in zoom-in-95 duration-500' : 'animate-in slide-in-from-top-4'}`}>
             
             {showFullDatabase && (
                 <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                     <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-ashoka rounded-2xl flex items-center justify-center text-white shadow-xl shadow-ashoka/10 animate-float"><Database className="w-7 h-7" /></div>
                         <div>
                             <h2 className="text-3xl font-black text-ashoka uppercase tracking-tighter leading-tight flex items-center gap-3">
                                 National Verification Node
                             </h2>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Strategic Multi-Circuit Personnel Registry</p>
                         </div>
                     </div>
                     <button onClick={() => setShowFullDatabase(false)} className="w-12 h-12 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full flex items-center justify-center border border-slate-200 transition-all shadow-sm hover:rotate-90">
                         <X className="w-6 h-6" />
                     </button>
                 </div>
             )}

             <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                 <div className="relative w-full max-w-lg group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ashoka transition-colors" />
                     <input 
                         type="text" 
                         value={searchTerm}
                         onChange={(e) => searchTermOverride ? null : setLocalSearchTerm(e.target.value)}
                         placeholder="Enter Global UID (Passport / Aadhaar) / Full Name..." 
                         className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-black text-ashoka uppercase tracking-widest focus:border-ashoka/30 shadow-sm outline-none transition-all" 
                     />
                 </div>
                 <div className="flex gap-3 w-full md:w-auto">
                     <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                         {['ALL', 'PENDING', 'VERIFIED'].map((status) => (
                             <button 
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${statusFilter === status ? 'bg-ashoka text-white shadow-lg shadow-ashoka/20' : 'text-slate-400 hover:text-ashoka'}`}
                             >
                                 {status}
                             </button>
                         ))}
                     </div>
                 </div>
             </div>

             <div className="bento-card !p-0 overflow-hidden border-slate-200 shadow-xl shadow-ashoka/5 animate-in slide-in-from-bottom-8 duration-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 font-black">Entity Pulse</th>
                                <th className="px-8 py-5 font-black">UID Sentinel Trace</th>
                                <th className="px-8 py-5 font-black">Operational Circuit</th>
                                <th className="px-8 py-5 font-black">Auth Status</th>
                                <th className="px-8 py-5 text-right font-black">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTourists.map((t) => (
                                <tr key={t.id} className="hover:bg-ashoka/[0.02] transition-colors group cursor-pointer" onClick={() => handleReview(t)}>
                                    <td className="px-8 py-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-ashoka/[0.03] text-ashoka flex items-center justify-center font-black text-[12px] border border-ashoka/10 group-hover:bg-ashoka group-hover:text-white group-hover:rotate-6 transition-all duration-300">{t.name.charAt(0)}</div>
                                        <div>
                                            <p className="text-xs font-black text-ashoka uppercase tracking-tight">{t.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 leading-none">Sector ID: {t.id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-[11px] font-black text-slate-900 tracking-[0.15em] break-all">{t.aadhaar || t.passport || 'NOT_IN_REGISTRY'}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-1.5 bg-slate-100/50 rounded-lg border border-slate-100">{t.circuit}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`status-badge w-max !text-[9px] ${getStatusStyles(t.status)}`}>
                                            {t.status === 'Verified' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="w-10 h-10 hover:bg-ashoka hover:text-white text-slate-300 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-transparent group-hover:border-ashoka/10"><ChevronRight className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
             {selectedTourist && <TouristDetailModal selectedTourist={selectedTourist} setSelectedTourist={closeModal} handleStatusUpdate={handleStatusUpdate} getStatusStyles={getStatusStyles} role={role} zone={zone} />}
        </div>
    );
};

const TouristDetailModal = ({ selectedTourist, setSelectedTourist, handleStatusUpdate, getStatusStyles, role, zone }) => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [showFullHistory, setShowFullHistory] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get(`/api/audit/tourist/${selectedTourist.id}/audit-trail`);
                setAuditLogs(response.data);
            } catch (error) { console.error('Audit trail sync failed'); } finally { setLoadingLogs(false); }
        };
        fetchLogs();
    }, [selectedTourist.id]);

    const displayedLogs = showFullHistory ? auditLogs : auditLogs.slice(0, 4);

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500 backdrop-blur-md">
            <div className={`bento-card bg-white !p-0 shadow-2xl overflow-hidden transition-all duration-500 ${showFullHistory ? 'max-w-3xl w-full h-[80vh]' : 'max-w-lg w-full scale-in'}`}>
                {/* Modal Header */}
                <div className="bg-ashoka p-6 flex justify-between items-center text-white relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-white/10 rounded-2xl"><Fingerprint className="w-6 h-6 text-saffron" /></div>
                        <div>
                            <h3 className="font-black uppercase tracking-widest text-sm leading-tight">Identity Sentinel Audit</h3>
                            <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em]">Hash Index: {selectedTourist.id.slice(-12)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                         {showFullHistory && (
                             <button onClick={() => setShowFullHistory(false)} className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">Brief Mode</button>
                         )}
                         <button onClick={setSelectedTourist} className="p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90"><X className="w-6 h-6" /></button>
                    </div>
                </div>

                <div className="flex h-full overflow-hidden">
                    <div className={`p-8 space-y-8 bg-white border-r border-slate-50 transition-all ${showFullHistory ? 'w-1/3' : 'w-full'}`}>
                        <div className="flex flex-col items-center">
                            <div className="relative group mb-4">
                                <div className="absolute inset-0 bg-ashoka/5 rounded-[40px] rotate-6"></div>
                                <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-300 border-2 border-dashed border-ashoka/10 relative z-10">
                                    <User className="w-10 h-10" />
                                </div>
                            </div>
                            <h4 className="text-lg font-black text-ashoka uppercase tracking-tighter">{selectedTourist.name}</h4>
                            <span className={`status-badge !text-[9px] mt-2 ${getStatusStyles(selectedTourist.status)}`}>{selectedTourist.status}</span>
                        </div>

                        {!showFullHistory && (
                            <>
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block">UID SENTINEL</span>
                                        <span className="text-[11px] font-black text-ashoka tracking-widest truncate block">{selectedTourist.aadhaar || selectedTourist.passport}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block">SECTOR CIRCUIT</span>
                                        <span className="text-[11px] font-black text-ashoka uppercase truncate block">{selectedTourist.circuit}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-ashoka uppercase tracking-[0.3em] flex items-center gap-2 border-l-4 border-saffron pl-2">
                                        Tactical Audit Trail
                                    </h5>
                                    <div className="space-y-3">
                                        {loadingLogs ? (
                                            <div className="space-y-2 animate-pulse">
                                                <div className="h-10 bg-slate-50 rounded-xl"></div>
                                                <div className="h-10 bg-slate-50 rounded-xl"></div>
                                            </div>
                                        ) : displayedLogs.length > 0 ? (
                                            displayedLogs.map((log, i) => (
                                                <div key={log.id || i} className="flex gap-3 items-start relative group">
                                                    {i < displayedLogs.length - 1 && <div className="absolute left-[7px] top-4 w-[2px] h-8 bg-slate-100"></div>}
                                                    <div className={`w-3.5 h-3.5 rounded-full z-10 mt-1 border-2 border-white shadow-sm ${log.actionType === 'Flag' ? 'bg-red-500' : log.actionType === 'Verify' ? 'bg-emerald-500' : 'bg-ashoka'}`}></div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-bold text-slate-700 leading-tight group-hover:text-ashoka transition-colors">{log.details}</p>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] font-bold text-slate-300 italic uppercase">No historical telemetry found</p>
                                        )}
                                    </div>
                                    {auditLogs.length > 4 && (
                                        <button 
                                            onClick={() => setShowFullHistory(true)}
                                            className="w-full py-2.5 text-[9px] font-black text-ashoka/60 hover:text-ashoka uppercase tracking-[0.3em] bg-ashoka/5 rounded-xl border border-dashed border-ashoka/10 transition-all hover:bg-ashoka/10"
                                        >
                                            Explore History Hub ({auditLogs.length})
                                        </button>
                                    )}
                                </div>

                                {selectedTourist.status !== 'Verified' ? (
                                    <div className="flex gap-4 pt-4 border-t border-slate-50">
                                        <button onClick={() => handleStatusUpdate(selectedTourist.id, 'Verified')} className="flex-1 btn-ashoka text-[10px] uppercase tracking-widest py-3">Approve</button>
                                        <button onClick={() => handleStatusUpdate(selectedTourist.id, 'Rejected')} className="flex-[0.5] bg-red-50 text-red-600 p-3 rounded-xl border border-red-100"><X className="w-4 h-4 mx-auto" /></button>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 p-4 rounded-xl text-center border-2 border-white">
                                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center justify-center gap-2">
                                            <ShieldCheck className="w-4 h-4" /> Node Locked
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {showFullHistory && (
                        <div className="flex-1 bg-slate-50/30 p-8 overflow-y-auto animate-in slide-in-from-right-8 duration-500 custom-scrollbar">
                             <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-ashoka uppercase tracking-[0.3em] flex items-center gap-3">Global History</h3>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">6 Logs Displayed</div>
                             </div>

                             <div className="space-y-6">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="bento-card border-none bg-white p-6 shadow-xl relative group">
                                        <div className={`absolute left-0 top-0 h-full w-1 ${log.actionType === 'Flag' ? 'bg-red-500' : 'bg-ashoka'}`}></div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${log.actionType === 'Flag' ? 'bg-red-50 text-red-600' : 'bg-ashoka/10 text-ashoka'}`}>
                                                {log.actionType}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wide italic">"{log.details}"</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdentityVerificationHub;
