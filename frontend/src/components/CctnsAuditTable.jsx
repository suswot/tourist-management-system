import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Fingerprint, CheckCircle, AlertTriangle, ShieldAlert, Send } from 'lucide-react';

const CctnsAuditTable = ({ tourists, onStatusUpdate, role, zone }) => {

    const handlePoliceClearance = async (id, status) => {
        try {
            await axios.patch(`http://localhost:5000/api/audit/tourist/${id}/police-status`, { status }, {
                headers: { role, zone }
            });
            toast.success(`CCTNS Record updated to ${status}`);
            onStatusUpdate(id, status);
        } catch (error) {
            console.error('Update failed:', error);
            toast.error("Network or Auth Error updating Police Status");
        }
    }

    const getPoliceStatusStyles = (status) => {
        switch (status) {
            case 'Verified': return 'bg-green-50 text-green-700 border-green-200';
            case 'Flagged': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Security Risk': return 'bg-red-50 text-red-700 border-red-300 shadow-sm';
            default: return 'bg-gray-50 text-gray-500 border-gray-200';
        }
    }

    const handleForwardTicket = async (touristId, tName) => {
        try {
            await axios.post('http://localhost:5000/api/tickets', {
                type: 'Police_Forward',
                referenceId: touristId,
                title: `Police Background Check Requested: ${tName}`,
                senderRole: 'Tourism_Manager',
                receiverRole: 'Police'
            });
            toast.success(`Ticket dispatched to Police CCTNS for ${tName}`, { icon: '👮‍♂️' });
        } catch (error) {
            console.error('Failed to dispatch ticket:', error);
            toast.error("Failed to forward ticket");
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full h-full">
            <div className="border-b border-gray-100 p-5 bg-ashoka text-white flex justify-between items-center rounded-t-xl">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-saffron" />
                        Live Tourist Profiles (CCTNS Simulated Segment)
                    </h2>
                    <p className="text-sm text-ashoka-100 mt-1 font-medium opacity-80">
                        Authority Level Audit / NIDHI+ Data Compliant
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto p-0">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Tourist Identity</th>
                            <th className="px-6 py-4">Circuit Itinerary</th>
                            <th className="px-6 py-4 w-56 text-center">Police Clearance (Toggle)</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tourists.map((t) => (
                            <tr key={t.id} className={`hover:bg-gray-50/50 transition-colors ${t.sosActive ? 'bg-red-50/20' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 group flex items-center gap-2">
                                            {t.name}
                                            {t.sosActive && <span className="bg-red-100 text-red-700 px-1.5 rounded text-[10px] uppercase font-bold animate-pulse">SOS!</span>}
                                        </span>
                                        <span className="text-xs text-gray-500 font-mono mt-0.5 tracking-tight">
                                            {t.aadhaar ? `UID: ${t.aadhaar}` : `PPT: ${t.passport}`}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-ashoka border border-blue-100">
                                        {t.circuit}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center">
                                        {role === 'Police' ? (
                                            <div className="flex items-center gap-1 justify-center bg-gray-50 p-1 rounded-lg border border-gray-100 w-max mx-auto shadow-sm">
                                                <button
                                                    onClick={() => handlePoliceClearance(t.id, 'Verified')}
                                                    className={`p-1.5 rounded-md transition-all ${t.policeStatus === 'Verified' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                                                    title="Verify"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-gray-200"></div>
                                                <button
                                                    onClick={() => handlePoliceClearance(t.id, 'Flagged')}
                                                    className={`p-1.5 rounded-md transition-all ${t.policeStatus === 'Flagged' ? 'bg-saffron/20 text-orange-700 shadow-sm' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                                                    title="Flag"
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-gray-200"></div>
                                                <button
                                                    onClick={() => handlePoliceClearance(t.id, 'Security Risk')}
                                                    className={`p-1.5 rounded-md transition-all ${t.policeStatus === 'Security Risk' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                                                    title="Mark as Risk"
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleForwardTicket(t.id, t.name)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition-colors"
                                            >
                                                <Send className="w-3.5 h-3.5" /> Forward to Police
                                            </button>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-block px-3 py-1 text-xs font-bold border rounded-full ${getPoliceStatusStyles(t.policeStatus)}`}>
                                        {t.policeStatus.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CctnsAuditTable;
