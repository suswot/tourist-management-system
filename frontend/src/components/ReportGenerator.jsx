import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Map, BarChart3, AlertTriangle, Cpu, Navigation, Activity, ChevronRight, Download } from 'lucide-react';

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

const ReportGenerator = ({ zone, role }) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredCity, setHoveredCity] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/audit/reports/graphical?zone=${encodeURIComponent(zone || 'North')}`, {
                    headers: { role, zone }
                });
                setReportData(response.data);
            } catch (error) {
                console.error('Failed to fetch graphical report', error);
                toast.error('Failed to load safety heatmap');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [zone]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full flex flex-col items-center justify-center animate-pulse">
                <Map className="w-12 h-12 text-ashoka mb-4 opacity-50" />
                <p className="text-gray-400 font-bold uppercase tracking-widest">Compiling Geographic Safety Scan...</p>
            </div>
        );
    }

    if (!reportData) return null;

    const criticalCount = reportData.heatmap.filter(d => d.isCritical).length;

    return (
        <div className="bg-gray-100 rounded-none border-[3px] border-gray-300 p-4 sm:p-6 h-full space-y-6 shadow-xl relative overflow-hidden">
            {/* Header Section */}
            <div className="border-b-[3px] border-gray-300 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-wider">
                        <Map className="w-7 h-7 text-ashoka" />
                        Intelligence Heatmap
                    </h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                        Live Capacity & Threat Tracking — {zone || 'North'} Region
                    </p>
                </div>
                {criticalCount > 0 && (
                    <div className="animate-pulse flex items-center gap-2 bg-red-600 text-white px-4 py-2 font-black text-sm uppercase shadow-lg border-2 border-red-800">
                        <AlertTriangle className="w-5 h-5" /> {criticalCount} Hotspots Detected!
                    </div>
                )}
            </div>

            {/* AI Incident Summary */}
            <div className={`p-4 rounded-none border-l-4 shadow-md relative z-10 transition-colors ${criticalCount > 0 ? 'bg-red-50 border-red-600 text-red-900 border-y border-r border-red-200' : 'bg-white border-ashoka text-gray-800 border-y border-r border-gray-300'}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Cpu className={`w-5 h-5 ${criticalCount > 0 ? 'text-red-600' : 'text-ashoka'}`} />
                        <h3 className="font-extrabold uppercase tracking-widest text-sm">System Assessment</h3>
                    </div>
                </div>
                <p className="text-sm font-semibold tracking-wide leading-relaxed">{reportData.summary}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                {/* Tactical Geographic Canvas (Interactive Map) */}
                <div className="lg:col-span-2 bg-[#0a0f1c] rounded-xl border border-[#1e293b] shadow-2xl flex flex-col h-[500px] overflow-hidden relative group">

                    {/* Grid Background */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-900/20 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                    <div className="p-4 border-b border-[#1e293b] bg-[#0d1424] flex justify-between items-center z-20">
                        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-emerald-500" /> Strategic Zone Radar
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Critical</span>
                            <span className="flex items-center gap-1 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Warn</span>
                            <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe</span>
                        </div>
                    </div>

                    <div className="flex-1 relative z-10 w-full h-full p-4 overflow-hidden">
                        {/* Map Nodes container */}
                        <div className="absolute inset-4 lg:inset-8">
                            {reportData.heatmap.map((loc, idx) => {
                                const coords = CITY_COORDINATES[loc.name] || {
                                    x: 20 + (idx * 15) % 60,
                                    y: 20 + (idx * 20) % 60
                                };

                                const isCritical = loc.percentage >= 85;
                                const isWarning = loc.percentage >= 50 && !isCritical;
                                const isSafe = loc.percentage < 50;

                                let nodeColor = 'bg-emerald-500 border-emerald-400 text-emerald-400';
                                if (isCritical) nodeColor = 'bg-red-600 border-red-500 text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-pulse';
                                else if (isWarning) nodeColor = 'bg-orange-500 border-orange-400 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]';

                                const isHovered = hoveredCity === loc.name;

                                return (
                                    <div
                                        key={idx}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                                        style={{ left: `${coords.x}%`, top: `${coords.y}%`, zIndex: isCritical || isHovered ? 50 : 10 }}
                                        onMouseEnter={() => setHoveredCity(loc.name)}
                                        onMouseLeave={() => setHoveredCity(null)}
                                    >
                                        <div className={`w-4 h-4 rounded border-2 ${nodeColor} transition-transform duration-200 ${isHovered ? 'scale-150' : ''}`}></div>
                                        <span className={`mt-2 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded transition-colors ${isHovered ? 'text-white bg-[#0f172a]' : nodeColor.replace('bg-', 'text-').split(' ')[0]}`}>
                                            {loc.name}
                                        </span>

                                        {/* Hover Tooltip Menu */}
                                        {isHovered && (
                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 bg-white border-2 border-gray-900 shadow-2xl rounded p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="text-gray-900 font-black uppercase border-b border-gray-200 pb-2 mb-2 break-words">
                                                    {loc.name}
                                                    {isCritical && <AlertTriangle className="w-3 h-3 text-red-600 inline ml-2 animate-bounce" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                                        <span>Occupancy:</span>
                                                        <span className="text-gray-900">{loc.count} / {loc.capacity}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                                        <span>Density:</span>
                                                        <span className={`font-black ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-emerald-600'}`}>{loc.percentage}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Trend Analysis Flow Panel */}
                <div className="bg-white p-0 rounded-none border-[3px] border-gray-300 shadow-md flex flex-col h-[500px]">
                    <div className="bg-gray-100 border-b border-gray-300 p-4">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-5 h-5 text-ashoka" />
                            Capacity Distribution
                        </h3>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-5 custom-scrollbar">
                        {reportData.trendData.map((loc, idx) => (
                            <div
                                key={idx}
                                className="group cursor-pointer"
                                onMouseEnter={() => setHoveredCity(loc.name)}
                                onMouseLeave={() => setHoveredCity(null)}
                            >
                                <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-xs font-bold uppercase text-gray-700 flex items-center gap-1">
                                        <ChevronRight className={`w-3 h-3 transition-colors ${hoveredCity === loc.name ? 'text-ashoka' : 'text-transparent'}`} />
                                        {loc.name}
                                    </span>
                                    <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm ${loc.isCritical ? 'bg-red-100 text-red-700' : loc.percentage >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {loc.percentage}%
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-gray-200 rounded-sm overflow-hidden relative">
                                    {/* Tick marks behind progress for detail */}
                                    <div className="absolute inset-0 flex justify-between pointer-events-none px-2 opacity-30">
                                        <div className="h-full w-px bg-gray-500"></div>
                                        <div className="h-full w-px bg-gray-500"></div>
                                        <div className="h-full w-px bg-gray-500"></div>
                                    </div>
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${loc.isCritical ? 'bg-red-600' : loc.percentage > 50 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(loc.percentage, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-1 text-[9px] font-bold text-gray-400 uppercase px-1">
                                    <span>0</span>
                                    <span>{loc.capacity} MAX</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-gray-50 mt-auto">
                        <button
                            onClick={() => window.print()}
                            className="w-full bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300 font-extrabold text-[11px] uppercase tracking-widest p-3 flex items-center justify-center gap-2 transition-colors focus:ring-4 focus:ring-gray-200"
                        >
                            <Download className="w-4 h-4" /> Export Govt. PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportGenerator;
