import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Users, Radio, MapPin, ExternalLink } from 'lucide-react';

const OperationsCockpit = ({ tourists, setActiveTab, role }) => {
    // Simulated values based on passed in tourist data
    const activeTourists = tourists.length;
    const securityRisks = tourists.filter(t => t.policeStatus === 'Security Risk').length;
    const activeSOS = tourists.filter(t => t.sosActive).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Active Tourists Pulse */}
            <div
                onClick={() => setActiveTab('identity')}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-colors"
            >
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        Active Profiles <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                    </h3>
                    <p className="text-3xl font-bold text-ashoka mt-1">{activeTourists}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center relative">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-ashoka opacity-10 animate-ping"></span>
                    <Users className="h-6 w-6 text-ashoka relative" />
                </div>
            </div>

            {/* Security Risks Pulse */}
            <div
                onClick={() => ['Police', 'Tourism_Manager'].includes(role) ? setActiveTab('cctns') : null}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between group cursor-pointer hover:border-gray-300 transition-colors"
            >
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        Security Risks {['Police', 'Tourism_Manager'].includes(role) && <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600" />}
                    </h3>
                    <p className={`text-3xl font-bold mt-1 ${securityRisks > 0 ? 'text-gray-800' : 'text-gray-400'}`}>{securityRisks}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <ShieldAlert className={`h-6 w-6 ${securityRisks > 0 ? 'text-gray-800' : 'text-gray-400'}`} />
                </div>
            </div>

            {/* Active SOS Blinker widget */}
            <div
                onClick={() => ['Police', 'Tourism_Manager'].includes(role) ? setActiveTab('cctns') : null}
                className={`rounded-xl shadow-sm border p-5 flex items-center justify-between transition-colors group cursor-pointer ${activeSOS > 0 ? 'bg-red-50 border-red-200 hover:border-red-400' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
                <div>
                    <h3 className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-1 ${activeSOS > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        Active SOS {['Police', 'Tourism_Manager'].includes(role) && <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />}
                    </h3>
                    <p className={`text-3xl font-bold mt-1 ${activeSOS > 0 ? 'text-red-700' : 'text-gray-400'}`}>{activeSOS}</p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center relative ${activeSOS > 0 ? 'bg-red-100' : 'bg-gray-50'}`}>
                    {activeSOS > 0 && <span className="absolute inline-flex h-full w-full rounded-full bg-saffron opacity-40 animate-ping"></span>}
                    <Radio className={`h-6 w-6 relative ${activeSOS > 0 ? 'text-saffron animate-pulse' : 'text-gray-400'}`} />
                </div>
            </div>

        </div>
    );
};

export default OperationsCockpit;
