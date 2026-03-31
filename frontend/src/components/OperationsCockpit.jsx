import React from 'react';
import { Users, AlertCircle, ShieldCheck, Zap, Activity, Signal, ShieldAlert, Cpu } from 'lucide-react';

const OperationsCockpit = ({ tourists, role, zone }) => {
    const verifiedCount = tourists.filter(t => t.status === 'Verified').length;
    const activeSOSEvents = tourists.filter(t => t.sosActive).length;
    const riskFactor = tourists.filter(t => t.policeStatus === 'Flagged' || t.policeStatus === 'Security Risk').length;
    const vipInSector = tourists.filter(t => t.is_VIP).length;

    const safePercentage = tourists.length === 0 ? 0 : ((verifiedCount / tourists.length) * 100);
    const stats = [
        { 
            label: 'Sector Personnel', 
            value: tourists.length, 
            icon: Users, 
            color: 'text-ashoka', 
            bg: 'bg-ashoka/5',
            trend: 'Live'
        },
        { 
            label: 'Identities Verified', 
            value: verifiedCount, 
            icon: ShieldCheck, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50',
            trend: `${safePercentage.toFixed(0)}%`
        },
        { 
            label: 'Strategic Risks', 
            value: riskFactor, 
            icon: AlertCircle, 
            color: 'text-red-600', 
            bg: 'bg-red-50',
            trend: riskFactor > 5 ? 'Elevated' : 'Stable'
        },
        { 
            label: 'Sector VIPs', 
            value: vipInSector, 
            icon: Zap, 
            color: 'text-saffron', 
            bg: 'bg-saffron/5',
            trend: 'Priority'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="bento-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-slate-50 border-bl rounded-bl-3xl opacity-50"></div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{stat.trend}</span>
                                <div className={`w-2 h-2 rounded-full ${stat.color} animate-pulse`}></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-ashoka -mb-1">{stat.value}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
                             <div className={`h-full ${stat.color.replace('text', 'bg')}`} style={{ width: '40%' }}></div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Live Operational Ticker Bar */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-ashoka text-white/90 p-4 rounded-3xl flex items-center justify-between overflow-hidden relative shadow-lg shadow-ashoka/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                        <Signal className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Nodal Synchronisation Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <Cpu className="w-4 h-4 text-saffron" />
                         <p className="text-[10px] font-bold uppercase tracking-widest leading-none">
                             <span className="text-white/40">Lat: {zone || 'North'} Sector | </span> Processor: Distributed Grid | <span className="text-emerald-400">Status: Nominal</span>
                         </p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-2 px-4 border-l border-white/10">
                    <Activity className="w-4 h-4 text-white/40" />
                    <marquee className="w-64 text-[10px] font-bold uppercase tracking-widest">
                        {activeSOSEvents > 0 ? `🚨 ACTIVE SOS DETECTED IN ${zone || 'ALL'} COMMAND AREAS` : `Intelligence update complete. All sectors reporting normal tourist distribution patterns.`}
                    </marquee>
                </div>
            </div>
        </div>
    );
};

export default OperationsCockpit;
