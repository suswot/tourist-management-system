import React, { useState, useEffect, useRef } from 'react';
import IdentityVerificationHub from '../components/IdentityVerificationHub';
import LogisticsAudit from '../components/LogisticsAudit';
import CircuitsModule from '../components/CircuitsModule';
import OperationsCockpit from '../components/OperationsCockpit';
import UnifiedMapNode from '../components/UnifiedMapNode';
import CctnsAuditTable from '../components/CctnsAuditTable';
import LocalFeedback from '../components/LocalFeedback';
import { 
    ShieldAlert, Map, Bell, Search, Settings, User, 
    X, ShieldCheck, Zap, AlertTriangle, Radio, 
    WifiOff, UserCheck, ChevronRight, Fingerprint, LogOut, Lock
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';

const Dashboard = ({ role, zone, setRole, setZone }) => {
    const navigate = useNavigate();
    const [tourists, setTourists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedTouristGlobal, setSelectedTouristGlobal] = useState(null);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'DISPATCH', message: 'Tactical Unit confirmed at Sector 7 Node', time: '2m ago', priority: 'HIGH' },
        { id: 2, type: 'RISK', message: 'Saffron Mismatch detected in Himachal Circuit', time: '5m ago', priority: 'CRITICAL' },
        { id: 3, type: 'SAFE', message: 'VIP Enclave 4 marked SAFE by Liaison', time: '12m ago', priority: 'NORMAL' },
        { id: 4, type: 'SYSTEM', message: 'Srinagar Intelligence Hub Offline', time: '18m ago', priority: 'CRITICAL' }
    ]);

    const searchRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const fetchTourists = async () => {
            try {
                const response = await api.get('/api/audit/tourists');
                const data = response.data.map(t => ({
                    id: t._id,
                    name: t.name,
                    aadhaar: t.aadhaarNumber,
                    passport: t.passportNumber,
                    status: t.verificationStatus,
                    circuit: t.circuitId ? t.circuitId.name : 'Unknown Circuit',
                    city: t.zone || 'Unknown',
                    policeStatus: t.policeStatus || 'Pending',
                    sosActive: t.sosActive || false,
                    is_VIP: t.is_VIP || false,
                    zone: t.zone,
                }));
                setTourists(data);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchTourists();

        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [role, zone]);

    const handleCctnsStatusUpdate = (id, newStatus) => {
        setTourists(prev => prev.map(t => t.id === id ? { ...t, policeStatus: newStatus } : t));
    };

    const handleLogout = () => {
        const toastId = toast.loading("Terminating Tactical Session...");
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('zone');
            sessionStorage.clear();
            setRole?.(null);
            setZone?.(null);
            toast.success("Strategic Sign-Out Complete. Encryption Terminated.", { id: toastId });
            navigate('/', { replace: true });
        }, 1500);
    };

    const searchResults = searchTerm.length > 0 
        ? tourists.filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (t.aadhaar && t.aadhaar.includes(searchTerm)) ||
            (t.passport && t.passport.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : [];

    const handleSelectResult = (tourist) => {
        setSelectedTouristGlobal(tourist);
        setShowSearchDropdown(false);
        setSearchTerm(tourist.name);
    };

    return (
        <div className="min-h-screen pb-24 font-sans selection:bg-ashoka selection:text-white relative bg-[#f8fafc]">
            
            {/* National Command Navigation */}
            <nav className="glass-header mb-10 flex items-center justify-between border-ashoka/10 px-8 py-4 backdrop-blur-xl sticky top-0 z-[60]">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-10 h-10 bg-ashoka text-white rounded-xl flex items-center justify-center font-black shadow-lg">T</div>
                        <div className="hidden sm:block">
                            <h1 className="text-xs font-black text-ashoka uppercase tracking-tighter">National Node</h1>
                            <p className="text-[8px] font-black text-saffron uppercase tracking-widest">TMS Active Ops</p>
                        </div>
                    </div>
                </div>

                {/* UNIVERSAL SEARCH BAR WITH DROPDOWN */}
                <div className="flex-1 max-w-xl mx-8 relative" ref={searchRef}>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-ashoka transition-colors" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => {setSearchTerm(e.target.value); setShowSearchDropdown(true);}}
                            onFocus={() => setShowSearchDropdown(true)}
                            placeholder="Find Intelligence Node (UID / Name)..." 
                            className="w-full bg-slate-100 border border-transparent focus:bg-white focus:border-ashoka/20 rounded-2xl py-2.5 pl-12 pr-4 text-[11px] font-black text-ashoka uppercase tracking-widest transition-all outline-none"
                        />
                    </div>

                    {showSearchDropdown && searchTerm.length > 0 && (
                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[70]">
                            <div className="max-h-[350px] overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    searchResults.map((t) => (
                                        <div 
                                            key={t.id} 
                                            onClick={() => handleSelectResult(t)}
                                            className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-ashoka/5 text-ashoka flex items-center justify-center font-black text-[10px] group-hover:bg-ashoka group-hover:text-white transition-all">{t.name.charAt(0)}</div>
                                                <div>
                                                    <p className="text-[11px] font-black text-ashoka uppercase tracking-tighter">{t.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.aadhaar || t.passport}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-ashoka transform group-hover:translate-x-1 transition-all" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center bg-slate-50/50">
                                        <Fingerprint className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Intelligence Matches Found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 relative">
                    <div className="relative" ref={notifRef}>
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-ashoka text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            <Bell className="w-5 h-5 transition-transform" />
                            {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>}
                        </button>

                        {showNotifications && (
                            <div className="absolute top-[calc(100%+12px)] right-0 w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[70]">
                                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                    <h3 className="text-[10px] font-black text-ashoka uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-saffron" /> Priority Dispatch Feed
                                    </h3>
                                    <X className="w-4 h-4 text-slate-300 hover:text-red-500 cursor-pointer" onClick={() => setShowNotifications(false)} />
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 items-start relative group">
                                            {n.priority === 'CRITICAL' && <div className="absolute left-0 top-0 h-full w-1 bg-red-600"></div>}
                                            <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${
                                                n.type === 'DISPATCH' ? 'bg-ashoka/10 text-ashoka' : 
                                                n.type === 'RISK' ? 'bg-red-50 text-red-600' : 
                                                n.type === 'SYSTEM' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {n.type === 'DISPATCH' ? <ShieldCheck className="w-4 h-4" /> : 
                                                 n.type === 'RISK' ? <AlertTriangle className="w-4 h-4" /> : 
                                                 n.type === 'SYSTEM' ? <WifiOff className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-tight">{n.message}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-black text-slate-400">{n.time}</span>
                                                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                        n.priority === 'CRITICAL' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-100 text-slate-400'
                                                    }`}>{n.priority}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-2"></div>
                    
                    <button 
                        onClick={handleLogout}
                        className="group flex items-center gap-3 bg-white p-1 pr-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-red-500 group-hover:text-white flex items-center justify-center transition-all">
                            <LogOut className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-red-600">Sign-Out</span>
                    </button>
                </div>
            </nav>

            {/* BENTO GRID */}
            <div className="grid grid-cols-12 gap-8 px-8">
                
                <div className="col-span-12 animate-in fade-in slide-in-from-top-8 duration-700">
                    <OperationsCockpit tourists={tourists} role={role} zone={zone} />
                </div>

                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* ENHANCED UNIFIED MAP NODE - REPLACING STATIC REPORT MAP */}
                    <div className="bento-card !p-0 overflow-hidden shadow-2xl relative">
                        <ErrorBoundary>
                            <UnifiedMapNode tourists={tourists} role={role} zone={zone} />
                        </ErrorBoundary>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bento-card border-none shadow-xl border-l-4 border-l-saffron">
                            <IdentityVerificationHub 
                                touristsOverride={tourists} 
                                role={role} 
                                zone={zone} 
                                isCompact={true} 
                                searchTermOverride={searchTerm} 
                                selectedTouristOverride={selectedTouristGlobal}
                                onClearSelection={() => setSelectedTouristGlobal(null)}
                            />
                        </div>
                        <div className="bento-card border-none shadow-xl border-l-4 border-l-ashoka">
                             <LocalFeedback zone={zone} role={role} isCompact={true} />
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-8 lg:sticky lg:top-28">
                    <div className="bento-card border-l-8 border-l-red-600 bg-red-50/10 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="w-6 h-6 text-red-600 animate-pulse" />
                                <h3 className="text-sm font-black text-red-600 uppercase tracking-[0.2em]">Tactical Feed</h3>
                            </div>
                        </div>
                        <LogisticsAudit role={role} zone={zone} isFeedMode={true} />
                    </div>

                    <div className="bento-card bg-ashoka text-white border-none shadow-2xl p-8 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10"><Lock className="w-20 h-20" /></div>
                         <div className="flex items-center gap-3 mb-6 relative z-10">
                             <Settings className="w-5 h-5 text-saffron" />
                             <h3 className="text-sm font-black uppercase tracking-[0.2em]">Operational Node: {zone || 'North'}</h3>
                         </div>
                         <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed mb-6 relative z-10">
                             Encryption active. All movements in the {zone || 'Northern'} cluster are registered on the National Blockchain Ledger. Access Level: {role.replace('_', ' ')}.
                         </p>
                         <button className="w-full bg-white/10 hover:bg-white text-white hover:text-ashoka py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all relative z-10">
                             View Directives
                         </button>
                    </div>

                    <div className="bento-card border-none shadow-xl">
                         <ErrorBoundary>
                            <CircuitsModule isCompact={true} role={role} zone={zone} />
                         </ErrorBoundary>
                    </div>
                </div>

                <div className="col-span-12">
                    <div className="bento-card pt-8 border-none shadow-xl">
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <div className="w-1.5 h-6 bg-saffron rounded-full"></div>
                            <h3 className="text-lg font-black text-ashoka uppercase tracking-tighter">Clearance Registry (CCTNS)</h3>
                        </div>
                        <CctnsAuditTable tourists={tourists} onStatusUpdate={handleCctnsStatusUpdate} role={role} zone={zone} searchTermOverride={searchTerm} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
