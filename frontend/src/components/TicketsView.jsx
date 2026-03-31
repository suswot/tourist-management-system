import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { Ticket, CheckCircle, Clock } from 'lucide-react';

const TicketsView = ({ role }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await api.get('/api/tickets');
                setTickets(response.data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                setLoading(false);
            }
        };
        if (role !== 'Tourism_Manager') {
            fetchTickets();
        }
    }, [role]);

    const handleAcknowledge = async (id) => {
        try {
            await api.patch(`/api/tickets/${id}`, { status: 'In Progress' });
            setTickets(prev => prev.map(t => t._id === id ? { ...t, status: 'In Progress' } : t));
            toast.success("Ticket Acknowledged");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update ticket status");
        }
    };

    if (role === 'Tourism_Manager') return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
            <div className="border-b border-gray-100 p-5 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-ashoka flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-saffron" />
                    Incoming Action Tickets ({role.replace('_', ' ')})
                </h2>
                <div className="flex gap-2">
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {tickets.length} Active
                    </span>
                </div>
            </div>

            <div className="p-0">
                {loading ? (
                    <div className="p-6 text-sm text-gray-500">Loading incoming tickets...</div>
                ) : tickets.length === 0 ? (
                    <div className="p-6 text-sm text-gray-400 font-medium">No open tickets at this time.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {tickets.map((t) => (
                            <div key={t._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-semibold text-gray-900">{t.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${t.status === 'Open' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {t.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">From: {t.senderRole.replace('_', ' ')} | Ref: {t._id}</p>
                                </div>
                                <div className="mt-4 sm:mt-0 flex gap-2">
                                    {t.status === 'Open' ? (
                                        <button
                                            onClick={() => handleAcknowledge(t._id)}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1"
                                        >
                                            <Clock className="w-3.5 h-3.5" /> Acknowledge
                                        </button>
                                    ) : (
                                        <button className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-md flex items-center gap-1 cursor-default opacity-80">
                                            <CheckCircle className="w-3.5 h-3.5" /> Working
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketsView;
