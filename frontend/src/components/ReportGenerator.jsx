import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { Map, BarChart3, AlertTriangle, Cpu, Navigation, Activity, ChevronRight, Download, Radio } from 'lucide-react';

// Relative coordinates on a 100x100 grid (roughly matching India's geography)
const CITY_COORDINATES = {
    'Delhi': { x: 30, y: 25 },
    'Jaipur': { x: 20, y: 35 },
    'Udaipur': { x: 15, y: 40 },
    'Shimla': { x: 32, y: 15 },
    'Manali': { x: 33, y: 10 },
    'Mumbai': { x: 15, y: 60 },
    'Goa': { x: 18, y: 70 },
    'Bhopal': { x: 32, y: 45 },
    'Chennai': { x: 40, y: 80 },
    'Kochi': { x: 28, y: 92 },
    'Munnar': { x: 32, y: 87 },
    'Mysore': { x: 30, y: 78 },
    'Kolkata': { x: 65, y: 50 },
    'Puri': { x: 60, y: 60 },
    'Bodh Gaya': { x: 55, y: 40 },
    'Darjeeling': { x: 65, y: 33 },
    'Guwahati': { x: 80, y: 38 },
    'Gangtok': { x: 72, y: 31 },
    'Dispur': { x: 82, y: 39 }
};

const ReportGenerator = ({ zone, role, isBento = false }) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredCity, setHoveredCity] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get('/api/audit/reports/graphical');
                setReportData(response.data);
            } catch (error) {
                console.error('Failed to fetch graphical report', error);
                toast.error('Failed to load safety heatmap');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [zone, role]);

    if (loading) {
        return (
            <div className="bg-slate-900 rounded-none h-[500px] flex flex-col items-center justify-center animate-pulse overflow-hidden relative">
                <Radio className="w-12 h-12 text-emerald-500 mb-4 opacity-50 animate-ping saturate-200" />
                <p className="text-emerald-400 font-black uppercase tracking-[0.3em] text-xs">Tactical Radar Sweep...</p>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
            </div>
        );
    }

    if (!reportData) return null;

    return (
        <div className={`relative ${isBento ? 'h-[500px]' : 'h-full'} w-full overflow-hidden bg-slate-950`}>
            {/* Tactical Grid Background */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-900/10 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            {/* AI Summary Banner (Glass Overlay) */}
            <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-1">
                        <Cpu className={`w-4 h-4 ${reportData.heatmap.some(d => d.isCritical) ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Autonomous System Scan Output</h4>
                    </div>
                    <p className="text-xs font-bold text-white/90 leading-relaxed tracking-wide">
                        {reportData.summary}
                    </p>
                </div>
            </div>

            {/* Live Legend */}
            <div className="absolute top-6 right-6 z-30 flex gap-4 pointer-events-none">
                 <div className="flex flex-col items-end">
                     <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">System Health</span>
                     <div className="flex gap-2">
                        <div className="w-1 h-3 bg-emerald-500/50 rounded-full"></div>
                        <div className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div className="w-1 h-3 bg-emerald-500/50 rounded-full"></div>
                     </div>
                 </div>
            </div>

            {/* MAP NODES */}
            <div className="absolute inset-10 z-20">
                {reportData.heatmap.map((loc, idx) => {
                    const coords = CITY_COORDINATES[loc.name] || {
                        x: 20 + (idx * 15) % 60,
                        y: 20 + (idx * 20) % 60
                    };

                    const isCritical = loc.percentage >= 85;
                    const isWarning = loc.percentage >= 50 && !isCritical;
                    const isHovered = hoveredCity === loc.name;

                    let nodeStyle = 'bg-emerald-500 border-emerald-400';
                    let glowStyle = 'rgba(16, 185, 129, 0.4)';
                    
                    if (isCritical) {
                        nodeStyle = 'bg-red-600 border-red-500 animate-pulse shadow-[0_0_20px_rgba(220,38,38,1)]';
                        glowStyle = 'rgba(239, 68, 68, 0.6)';
                    } else if (isWarning) {
                        nodeStyle = 'bg-orange-500 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.8)]';
                        glowStyle = 'rgba(249, 115, 22, 0.4)';
                    }

                    return (
                        <div
                            key={idx}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300"
                            style={{ left: `${coords.x}%`, top: `${coords.y}%`, zIndex: isCritical || isHovered ? 50 : 10 }}
                            onMouseEnter={() => setHoveredCity(loc.name)}
                            onMouseLeave={() => setHoveredCity(null)}
                        >
                            {/* Pulse Circle for Critical */}
                            {isCritical && (
                                <div className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 -left-0 -top-0 rounded-full border-2 border-red-600 animate-ping opacity-70"></div>
                            )}
                            
                            <div className={`w-3.5 h-3.5 rounded-full border-2 ${nodeStyle} transition-transform duration-300 ${isHovered ? 'scale-[2.5]' : ''}`}></div>
                            
                            <div className={`mt-3 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all whitespace-nowrap shadow-xl ${isHovered ? 'bg-ashoka text-white scale-110' : 'text-white/40 bg-slate-900 border border-slate-700'}`}>
                                {loc.name} <span className={`ml-1 ${isCritical ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-emerald-500'}`}>{loc.percentage}%</span>
                            </div>

                            {/* Hover Tactical Breakdown */}
                            {isHovered && (
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 bg-ashoka/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                                    <h5 className="text-[10px] font-black text-white/50 mb-2 uppercase tracking-widest">Sector Analysis</h5>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-white">
                                            <span>Occupancy</span>
                                            <span>{loc.count}/{loc.capacity}</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                                style={{ width: `${loc.percentage}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-white">
                                            <span>Strain Level</span>
                                            <span className={isCritical ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-emerald-400'}>{loc.utility_stress}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Visual Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,3px_100%]"></div>
        </div>
    );
};

export default ReportGenerator;
