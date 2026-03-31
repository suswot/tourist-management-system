import React, { useState, useMemo } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Flag, Search, ChevronRight, Scale, Clock, UserX } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const CctnsAuditTable = ({ tourists, onStatusUpdate, role, zone, searchTermOverride = '' }) => {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const searchTerm = searchTermOverride || localSearchTerm;

    const getSecurityStyles = (status) => {
        switch (status) {
            case 'Verified': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Flagged': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'Security Risk': return 'bg-red-50 text-red-700 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)] animate-pulse';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.patch(`/api/audit/tourist/${id}/police-status`, { status });
            onStatusUpdate(id, status);
            toast.success(`CCTNS Record: ${status} Clearance Node Updated`);
        } catch (error) { 
            console.error('CCTNS Update Error:', error);
            toast.error("Database Trace Fail: CCTNS Node Unreachable"); 
        }
    };

    const filtered = useMemo(() => {
        return tourists.filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (t.aadhaar && t.aadhaar.includes(searchTerm)) ||
            (t.passport && t.passport.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [tourists, searchTerm]);

    return (
        <div className="space-y-6">
            {!searchTermOverride && (
                <div className="relative group max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-ashoka transition-colors" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                        placeholder="CCTNS ID Trace / UID..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:border-ashoka/20 outline-none transition-all"
                    />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-black">Personnel Sentinel</th>
                            <th className="px-6 py-4 font-black">CCTNS Status</th>
                            <th className="px-6 py-4 text-right font-black">Police Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-ashoka/5 flex items-center justify-center font-black text-ashoka text-[10px] border border-ashoka/10 group-hover:bg-ashoka group-hover:text-white transition-all">
                                            {t.is_VIP ? <Shield className="w-4 h-4 text-saffron" /> : t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-ashoka uppercase tracking-wide leading-tight">{t.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hash: {t.id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`status-badge !text-[9px] w-max ${getSecurityStyles(t.policeStatus)}`}>
                                        {t.policeStatus === 'Verified' ? <ShieldCheck className="w-3.5 h-3.5" /> : 
                                         t.policeStatus === 'Security Risk' ? <UserX className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                        {t.policeStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {['Verified', 'Flagged', 'Security Risk'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdateStatus(t.id, status)}
                                                className={`p-2 rounded-lg border transition-all hover:scale-110 active:scale-95 ${t.policeStatus === status ? 'bg-ashoka text-white border-ashoka' : 'bg-white text-slate-400 border-slate-100 hover:text-ashoka hover:border-ashoka/20 hover:shadow-sm'}`}
                                                title={status}
                                            >
                                                {status === 'Verified' ? <ShieldCheck className="w-4 h-4" /> : 
                                                 status === 'Flagged' ? <Flag className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="py-12 text-center flex flex-col items-center gap-2">
                        <Scale className="w-10 h-10 text-slate-100 mb-2" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Intelligence Matches found in CCTNS Database</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AlertCircle = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

export default CctnsAuditTable;
