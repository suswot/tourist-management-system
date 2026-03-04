import React, { useState, useEffect } from 'react';
import { Building2, AlertTriangle, ShieldAlert, Navigation, Clock, ActivitySquare, Shield, Star, PhoneCall, Leaf, UserX } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const LogisticsAudit = ({ role, zone }) => {
    const [mismatches, setMismatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // VIP, SOS, PENDING, ZONE

    // Dispatch Modal State
    const [dispatchModal, setDispatchModal] = useState({ isOpen: false, mismatchId: null, touristName: '' });
    const [accessKey, setAccessKey] = useState('');

    const [citiesHealth, setCitiesHealth] = useState({});

    useEffect(() => {
        const fetchLogistics = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/audit/logistics-mismatch?role=${encodeURIComponent(role)}&zone=${encodeURIComponent(zone || 'North')}`);
                const formattedData = response.data.map((hotel) => ({
                    id: hotel._id,
                    tourist: hotel.touristId ? hotel.touristId.name : 'Unknown Tourist',
                    hotelName: hotel.hotelName,
                    district: hotel.location,
                    bookingSite: hotel.bookingSite,
                    alerts: hotel.securityAlerts || {},
                    flagged: true,
                    riskScore: hotel.priorityData?.riskScore || 0,
                    is_VIP: hotel.priorityData?.is_VIP || false,
                    zone: hotel.priorityData?.zone || 'North',
                    Guide_ID: hotel.Guide_ID,
                    guideVerified: hotel.guideVerified
                }));
                const sorted = formattedData.sort((a, b) => b.riskScore - a.riskScore);
                setMismatches(sorted);

                // Fetch Cities Health Status
                const citiesResponse = await axios.get(`http://localhost:5000/api/audit/cities?zone=${encodeURIComponent(zone || 'North')}`, {
                    headers: { role, zone }
                });
                const healthMap = {};
                citiesResponse.data.forEach(c => {
                    healthMap[c.name] = c.utility_stress;
                });
                setCitiesHealth(healthMap);
            } catch (error) {
                console.error('Error fetching logistics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogistics();
    }, [role, zone]);

    const triggerDispatchModal = (mismatchId, touristName) => {
        setDispatchModal({ isOpen: true, mismatchId, touristName });
        setAccessKey('');
    };

    const confirmDispatch = async () => {
        if (accessKey === '1234') {
            try {
                // Hit logging endpoint
                await axios.post('http://localhost:5000/api/audit/actions/log', {
                    actionType: 'Dispatch_Police',
                    targetId: dispatchModal.mismatchId,
                    targetModel: 'Hotel', // Given the IDs come from hotel rows
                    details: `Dispatch authorized for ${dispatchModal.touristName}`
                }, {
                    headers: { 'role': role, 'zone': zone }
                });

                toast.success(`Priority Unit dispatched to location for ${dispatchModal.touristName}!`, { icon: '🚨', duration: 3000 });
                setMismatches(prev => prev.filter(m => m.id !== dispatchModal.mismatchId));
                setDispatchModal({ isOpen: false, mismatchId: null, touristName: '' });
            } catch (error) {
                toast.error("Log Audit Failed. Try again.");
                console.error(error);
            }
        } else {
            toast.error("Failed Dispatch Attempt: Invalid Access Key", { duration: 4000 });
            setDispatchModal({ isOpen: false, mismatchId: null, touristName: '' });
        }
    };

    const cancelDispatch = () => {
        setDispatchModal({ isOpen: false, mismatchId: null, touristName: '' });
    };

    const getAlertTags = (alerts) => {
        const tags = [];
        if (alerts.capacityBreach) tags.push({ label: 'CAPACITY BREACH', color: 'bg-saffron text-white border-saffron', icon: <ActivitySquare className="w-3 h-3 mr-1" /> });
        if (alerts.safetyAnomaly) tags.push({ label: 'SAFETY ANOMALY', color: 'bg-red-600 text-white border-red-600', icon: <Navigation className="w-3 h-3 mr-1" /> });
        if (alerts.overstayEscalation) tags.push({ label: `OVERSTAY ESCALATION: ${alerts.overstayType || 'MISSING P.'}`, color: 'bg-orange-500 text-white border-orange-500', icon: <Clock className="w-3 h-3 mr-1" /> });
        return tags;
    };

    // Filter Logic
    const displayedMismatches = mismatches.filter(m => {
        if (filter === 'VIP') return m.is_VIP;
        if (filter === 'SOS') return m.alerts.overstayEscalation || Object.keys(m.alerts).length > 0;
        if (filter === 'ZONE') return m.zone === zone;
        if (filter === 'PENDING') return m.riskScore < 50;
        return true;
    });

    return (
        <div className="bg-gray-100 rounded-none border-2 border-gray-300 shadow-xl overflow-hidden relative">
            <div className="border-b-2 border-gray-300 p-4 bg-white flex justify-between items-center relative z-10 flex-col md:flex-row gap-4">
                <div className="flex flex-col w-full md:w-auto">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                        <ShieldAlert className="w-6 h-6 text-red-600 animate-pulse" />
                        Priority Action Engine
                    </h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 ml-8 truncate">
                        {role === 'VIP_Liaison' ? '★ VIP OVERSIGHT COMMAND' : 'MONITORING TIERED INFRASTRUCTURE'}
                    </p>
                </div>

                {/* Priority Filter Bar */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border ${filter === 'ALL' ? 'bg-ashoka text-white border-ashoka' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>ALL ALERTS</button>
                    {role === 'VIP_Liaison' || role === 'National_Admin' ?
                        <button onClick={() => setFilter('VIP')} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border ${filter === 'VIP' ? 'bg-saffron text-white border-saffron' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'}`}>VIP ONLY</button>
                        : null}
                    <button onClick={() => setFilter('SOS')} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border ${filter === 'SOS' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>SOS ONLY</button>
                    <button onClick={() => setFilter('ZONE')} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border ${filter === 'ZONE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>BY ZONE</button>
                    <button onClick={() => setFilter('PENDING')} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border ${filter === 'PENDING' ? 'bg-gray-800 text-white border-gray-800' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>PENDING (&lt;50)</button>
                </div>
            </div>

            <div className="p-4 bg-gray-100 h-[600px] overflow-y-auto space-y-4">
                {loading ? (
                    <div className="p-6 bg-white border-2 border-gray-200 space-y-4 shadow-sm">
                        <div className="animate-pulse space-y-4 py-1">
                            <div className="h-4 bg-gray-300 w-3/4"></div>
                            <div className="h-4 bg-gray-300 w-1/2"></div>
                            <div className="h-10 bg-gray-300 w-full mt-4"></div>
                        </div>
                    </div>
                ) : displayedMismatches.length === 0 ? (
                    <div className="bg-white p-8 text-center border-2 border-gray-200">
                        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-600 uppercase tracking-wide">No Active Alerts</h3>
                        <p className="text-gray-400 text-sm">All districts in view are within safe operational thresholds.</p>
                    </div>
                ) : (
                    displayedMismatches.map((m) => {
                        const tags = getAlertTags(m.alerts);
                        const isLevel1 = m.riskScore >= 90;
                        const cardStyle = isLevel1
                            ? "bg-white p-5 border-l-8 border-l-red-600 border border-gray-300 shadow-[0_0_15px_rgba(255,0,0,0.15)] relative overflow-hidden group hover:shadow-[0_0_25px_rgba(255,0,0,0.3)] transition-all z-10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-50/50 before:to-transparent before:-z-10"
                            : "bg-white p-5 border-l-4 border-l-saffron border border-gray-200 shadow-sm relative overflow-hidden group";

                        return (
                            <div key={m.id} className={cardStyle}>
                                {isLevel1 && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black animate-pulse">
                                        <AlertTriangle className="w-3 h-3" /> LEVEL 1 PRIORITY
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -z-10 group-hover:bg-gray-100 transition-colors"></div>

                                <div className="flex flex-col sm:flex-row justify-between gap-4 relative z-10">
                                    <div className="flex-1 mt-6 sm:mt-0">
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                            {m.is_VIP && (
                                                <span className="inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-black text-[#FFD700] shadow-sm">
                                                    <Star className="w-3 h-3 mr-1 fill-current" /> VIP OVERSIGHT PROFILE
                                                </span>
                                            )}
                                            {/* Status Tags */}
                                            {tags.map((tag, idx) => (
                                                <span key={idx} className={`inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${tag.color}`}>
                                                    {tag.icon} {tag.label}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Data Grid */}
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    District Location
                                                    <Leaf className={`w-3 h-3 ${citiesHealth[m.district] === 'RESOURCE_STRAIN' ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
                                                </p>
                                                <p className="text-sm font-black text-gray-900 mt-0.5">{m.district} <span className="text-gray-400 font-normal">({m.zone})</span></p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    Tourist Profile {m.Guide_ID && !m.guideVerified && <UserX className="w-3 h-3 text-red-500 animate-bounce" title="Unverified Guide" />}
                                                </p>
                                                <p className="text-sm font-black text-gray-900 mt-0.5">{m.tourist}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logistics Node & Guide</p>
                                                <p className="text-sm font-medium text-gray-600 mt-0.5 flex flex-wrap items-center gap-1.5">
                                                    <Building2 className="w-4 h-4 text-ashoka" />
                                                    {m.hotelName} <span className="text-xs text-saffron font-bold border-l border-gray-300 pl-2 ml-1">Vendor: {m.bookingSite}</span>
                                                    {m.Guide_ID && (
                                                        <span className={`text-[10px] px-2 py-0.5 ml-2 border rounded uppercase font-black font-bold flex items-center gap-1 ${m.guideVerified ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-red-400 text-red-700 bg-red-50'}`}>
                                                            Guide: {m.Guide_ID} {m.guideVerified ? '✅' : '🚫 UNVERIFIED'}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* VIP Specific Layout Area */}
                                        {m.is_VIP && (
                                            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Secured Hotline Protocol</p>
                                                    <p className="text-xs font-medium text-gray-900 mt-0.5">Contact Protection Detail Immediately</p>
                                                </div>
                                                <button onClick={() => toast.success(`Hotline linked to Liaison for ${m.tourist}`)} className="bg-black hover:bg-gray-800 text-[#FFD700] px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-2 transition-all">
                                                    <PhoneCall className="w-3 h-3" /> Rapid Response
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex flex-col sm:items-end sm:justify-center mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-4 min-w-[180px]">
                                        <div className="text-center sm:text-right w-full mb-3">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assessed Threat Level</p>
                                            <div className="flex items-center sm:justify-end gap-2">
                                                <span className={`text-2xl font-black ${isLevel1 ? 'text-red-600' : 'text-gray-900'}`}>{m.riskScore}</span>
                                                <span className="text-xs text-gray-500 font-bold">/ 100</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => triggerDispatchModal(m.id, m.tourist)}
                                            className="w-full flex items-center justify-center gap-2 bg-ashoka hover:bg-[#000066] text-white px-6 py-3 font-bold text-[11px] uppercase tracking-wider transition-all shadow-md active:scale-95 border border-[#000044]"
                                        >
                                            <ShieldAlert className="w-4 h-4" /> Dispatch Unit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Dispatch Confirmation Guardrail Modal */}
            {dispatchModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-600 p-4 text-center">
                            <ShieldAlert className="w-10 h-10 text-white mx-auto mb-2 animate-pulse" />
                            <h3 className="text-white font-black uppercase tracking-wider text-lg">Confirm Emergency Dispatch?</h3>
                        </div>
                        <div className="p-6 space-y-4 text-center">
                            <p className="text-sm font-bold text-gray-600">
                                Target: <span className="text-gray-900">{dispatchModal.touristName}</span>
                            </p>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black uppercase text-gray-500 tracking-widest text-left">
                                    Enter Security Access Key
                                </label>
                                <input
                                    type="password"
                                    value={accessKey}
                                    onChange={(e) => setAccessKey(e.target.value)}
                                    placeholder="••••"
                                    className="w-full text-center tracking-[1em] font-bold text-lg p-3 rounded-lg border-2 border-gray-200 focus:border-red-600 focus:ring-red-600 bg-gray-50 uppercase shadow-inner"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && confirmDispatch()}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={cancelDispatch}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDispatch}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded shadow-md"
                                >
                                    Authorize
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default LogisticsAudit;
