import React from 'react';
import IdentityVerificationHub from '../components/IdentityVerificationHub';
import LogisticsAudit from '../components/LogisticsAudit';
import CircuitsModule from '../components/CircuitsModule';
import OperationsCockpit from '../components/OperationsCockpit';
import ReportGenerator from '../components/ReportGenerator';
import CctnsAuditTable from '../components/CctnsAuditTable';
import TicketsView from '../components/TicketsView';
import LocalFeedback from '../components/LocalFeedback';
import { toast } from 'react-hot-toast';
import { LayoutDashboard, UserCheck, Building2, Map, ShieldCheck, FileText, Ticket, Flame, Bell } from 'lucide-react';
import axios from 'axios';

const HotspotBanner = ({ zone, role }) => {
    const [criticalHotspots, setCriticalHotspots] = React.useState([]);

    React.useEffect(() => {
        const fetchHotspots = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/audit/reports/graphical?zone=${encodeURIComponent(zone || 'North')}`, {
                    headers: { role, zone }
                });
                const critical = response.data.heatmap.filter(d => d.isCritical);
                setCriticalHotspots(critical);
            } catch (error) {
                // Silent catch for banner
            }
        };
        fetchHotspots();
    }, [zone]);

    if (criticalHotspots.length === 0) return null;

    const names = criticalHotspots.map(d => d.name).join(', ');

    return (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-[0_4px_20px_rgba(255,0,0,0.4)] relative z-50 mb-4 animate-in slide-in-from-top border-b-4 border-red-800">
            <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 animate-bounce" />
                <span className="font-black tracking-widest uppercase text-sm">{`${zone || 'North'} ZONE > `}</span>
                <span className="font-bold text-sm bg-red-800 px-2 py-0.5 rounded animate-pulse">{names} CRITICAL</span>
            </div>
            <div className="text-xs font-bold bg-white text-red-600 px-2 py-1 rounded">Immediate Attention Required</div>
        </div>
    );
};

const Dashboard = ({ role, zone }) => {

    const [tourists, setTourists] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('identity');

    React.useEffect(() => {
        const fetchTourists = async () => {
            try {
                // We're mimicking the IdentityVerificationHub fetch here to share data 
                const response = await fetch(`http://localhost:5000/api/audit/tourists?role=${encodeURIComponent(role)}&zone=${encodeURIComponent(zone || 'North')}`);
                const data = await response.json();
                const formattedData = data.map(t => ({
                    id: t._id,
                    name: t.name,
                    aadhaar: t.aadhaarNumber,
                    passport: t.passportNumber,
                    status: t.verificationStatus,
                    circuit: t.circuitId ? t.circuitId.name : 'Unknown Circuit',
                    policeStatus: t.policeStatus || 'Pending',
                    sosActive: t.sosActive || false,
                    is_VIP: t.is_VIP || false,
                    zone: t.zone,
                }));
                setTourists(formattedData);
            } catch (error) {
                console.error('Error fetching global tourists:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTourists();
    }, [role, zone]);

    const handleCctnsStatusUpdate = (id, newStatus) => {
        setTourists(prev => prev.map(t => t.id === id ? { ...t, policeStatus: newStatus } : t));
    };

    const tabs = [];
    if (['Tourism_Manager', 'Zone_Manager', 'National_Admin', 'Regional_Admin'].includes(role)) tabs.push({ id: 'identity', label: 'KYC & Identity', icon: UserCheck });
    if (['Tourism_Manager', 'Zone_Manager', 'National_Admin', 'Regional_Admin', 'Booking_Site', 'Police', 'VIP_Liaison'].includes(role)) tabs.push({ id: 'logistics', label: 'Command Feed', icon: Building2 });
    if (['Tourism_Manager', 'National_Admin'].includes(role)) tabs.push({ id: 'circuits', label: 'Jurisdictions', icon: Map });
    if (['Tourism_Manager', 'Zone_Manager', 'National_Admin', 'Regional_Admin', 'Police'].includes(role)) tabs.push({ id: 'cctns', label: 'Police CCTNS', icon: ShieldCheck });
    if (['Police', 'Booking_Site'].includes(role)) tabs.push({ id: 'tickets', label: 'Tickets', icon: Ticket });
    if (['Tourism_Manager', 'National_Admin', 'Police'].includes(role)) tabs.push({ id: 'reports', label: 'Reports', icon: FileText });
    if (['Tourism_Manager', 'Zone_Manager', 'National_Admin', 'Regional_Admin'].includes(role)) {
        tabs.push({ id: 'inbox', label: 'Inbox', icon: Bell, isNotification: true });
    }

    React.useEffect(() => {
        const hasTab = tabs.find(t => t.id === activeTab);
        if (!hasTab && tabs.length > 0) setActiveTab(tabs[0].id);
    }, [role, tabs, activeTab]);

    const hqMap = {
        'North': 'Delhi',
        'West/Central': 'Mumbai',
        'South': 'Chennai',
        'East': 'Kolkata',
        'North-East': 'Guwahati'
    };

    const regionLabel = zone === 'West/Central' ? 'West/Central Region' : `${zone || 'Northern'} Region`;

    // Formatting the Role string neatly
    const formatRole = (r) => {
        if (!r) return 'Zone Manager';
        return r.replace('_', ' ');
    };
    const formattedRole = formatRole(role);
    const dynamicHeader = `Role: ${formattedRole} | Jurisdiction: ${regionLabel} (${hqMap[zone || 'North']} HQ)`;

    return (
        <div className="space-y-6">
            <HotspotBanner zone={zone} role={role} />
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-col md:flex-row gap-4 md:gap-0">
                <div>
                    <h1 className="text-2xl font-black text-ashoka uppercase tracking-wider">Command Center</h1>
                    <p className="text-saffron mt-1 font-bold uppercase text-[11px] tracking-widest">{dynamicHeader}</p>
                </div>
            </div>

            {/* Always Visible Cockpit Panel */}
            <OperationsCockpit tourists={tourists} setActiveTab={setActiveTab} role={role} />

            {/* MMT-Style Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-x-auto">
                <div className="flex items-center gap-1 sm:gap-2 justify-start sm:justify-center min-w-max">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center justify-center min-w-[90px] px-3 py-3 rounded-xl transition-all relative ${isActive
                                    ? 'text-blue-600 bg-blue-50/50'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                style={isActive ? { borderBottom: '3px solid #3b82f6', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : { borderBottom: '3px solid transparent' }}
                            >
                                <div className="relative mb-1.5">
                                    <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} strokeWidth={1.5} />
                                    {tab.isNotification && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                                </div>
                                <span className={`text-[11px] font-bold tracking-wide uppercase ${isActive ? 'text-blue-600' : ''}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tabbed Content Container */}
            <div className="min-h-[500px]">
                {activeTab === 'identity' && ['Tourism_Manager', 'Zone_Manager', 'National_Admin', 'Regional_Admin'].includes(role) && (
                    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                        <IdentityVerificationHub touristsOverride={tourists} role={role} zone={zone} />
                    </div>
                )}

                {activeTab === 'logistics' && (
                    <div className="animate-in fade-in duration-300 mx-auto w-full px-2">
                        <LogisticsAudit role={role} zone={zone} />
                    </div>
                )}

                {activeTab === 'circuits' && ['Tourism_Manager', 'National_Admin'].includes(role) && (
                    <div className="animate-in fade-in duration-300 max-w-3xl mx-auto">
                        <CircuitsModule />
                    </div>
                )}

                {activeTab === 'cctns' && ['Tourism_Manager', 'Police', 'Zone_Manager'].includes(role) && (
                    <div className="animate-in fade-in duration-300">
                        {!loading && <CctnsAuditTable tourists={tourists} onStatusUpdate={handleCctnsStatusUpdate} role={role} zone={zone} />}
                    </div>
                )}

                {activeTab === 'tickets' && ['Police', 'Booking_Site'].includes(role) && (
                    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                        <TicketsView role={role} />
                    </div>
                )}

                {activeTab === 'reports' && ['Tourism_Manager', 'National_Admin', 'Police'].includes(role) && (
                    <div className="animate-in fade-in duration-300 max-w-5xl mx-auto">
                        <ReportGenerator zone={zone} role={role} />
                    </div>
                )}

                {activeTab === 'inbox' && ['Tourism_Manager', 'Zone_Manager', 'National_Admin', 'Regional_Admin'].includes(role) && (
                    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                        <LocalFeedback zone={zone} role={role} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
