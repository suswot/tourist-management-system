import React, { useState, useEffect } from 'react';
import { Map, MapPin, Plus, X, Edit2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CircuitsModule = () => {
    const [circuits, setCircuits] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCircuit, setEditingCircuit] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', locations: '', isActive: true });

    useEffect(() => {
        const fetchCircuits = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/audit/circuits');
                const formattedData = response.data.map(c => ({
                    id: c._id,
                    name: c.name,
                    desc: c.locations.join(', '),
                    tourists: Math.floor(Math.random() * 200) + 50,
                    active: c.isActive
                }));
                setCircuits(formattedData);
            } catch (error) {
                console.error('Error fetching circuits:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCircuits();
    }, []);

    const handleManage = (circuit) => {
        setEditingCircuit(circuit);
        setFormData({
            name: circuit.name,
            description: circuit.description || '', // Assume backend returns desc sometimes or we map it
            locations: circuit.desc, // we mapped locations to desc in fetch
            isActive: circuit.active
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCircuit(null);
        setFormData({ name: '', description: '', locations: '', isActive: true });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCircuit) {
                await axios.patch(`http://localhost:5000/api/audit/circuit/${editingCircuit.id}`, formData);
                toast.success("Circuit Updated Successfully");
            } else {
                await axios.post('http://localhost:5000/api/audit/circuit', formData);
                toast.success("New Circuit Created");
            }
            setIsModalOpen(false);
            // Quick refresh
            const response = await axios.get('http://localhost:5000/api/audit/circuits');
            const formattedData = response.data.map(c => ({
                id: c._id, name: c.name, desc: c.locations.join(', '), tourists: Math.floor(Math.random() * 200) + 50, active: c.isActive
            }));
            setCircuits(formattedData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save circuit");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="border-b border-gray-100 p-5 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-ashoka flex items-center gap-2 uppercase tracking-wide">
                    <Map className="w-5 h-5 text-saffron" />
                    Geo-Jurisdictions Config
                </h2>
            </div>

            <div className="p-5 space-y-4">
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>)}
                    </div>
                ) : circuits.map(c => (
                    <div key={c.id} className="group relative bg-white border border-gray-100 rounded-lg p-4 hover:border-saffron/50 hover:shadow-sm transition-all cursor-pointer">
                        <div className="absolute top-4 right-4 bg-ashoka/5 text-ashoka text-xs font-bold px-2 py-1 rounded-md uppercase">
                            {c.tourists}
                            <span className="font-normal text-gray-500 ml-1">PAX</span>
                        </div>
                        <h3 className="font-bold text-gray-900 group-hover:text-saffron transition-colors uppercase tracking-wide">{c.name}</h3>
                        <p className="text-xs font-bold text-gray-500 mt-1 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-ashoka" />
                            {c.desc}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                            <span className={`text-xs font-medium px-2 py-1 rounded-md ${c.active ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {c.active ? 'Active Status' : 'Inactive'}
                            </span>
                            <button onClick={() => handleManage(c)} className="text-xs font-medium text-ashoka hover:underline flex items-center gap-1">
                                <Edit2 className="w-3 h-3" /> Manage
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <button
                    onClick={handleAdd}
                    className="flex justify-center items-center gap-2 text-xs font-black uppercase tracking-widest text-saffron hover:text-orange-600 transition-colors w-full py-2 border border-dashed border-orange-200 rounded-lg hover:bg-orange-50"
                >
                    <Plus className="w-4 h-4" /> Add Jurisdiction
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-black text-ashoka uppercase tracking-wide flex items-center gap-2">
                                <Map className="w-5 h-5 text-saffron" />
                                {editingCircuit ? 'Edit Jurisdiction' : 'Create Jurisdiction'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">Jurisdiction Command</label>
                                <input
                                    type="text" required
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-ashoka focus:ring-ashoka sm:text-sm p-3 bg-gray-50 border"
                                    placeholder="e.g. Northern Command"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required rows="2"
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-ashoka focus:ring-ashoka sm:text-sm p-2 bg-gray-50 border"
                                    placeholder="Brief description of the circuit"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">Cities / Districts (Comma separated)</label>
                                <input
                                    type="text" required
                                    value={formData.locations} onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-ashoka focus:ring-ashoka sm:text-sm p-3 bg-gray-50 border"
                                    placeholder="e.g. Manali, Shimla, Kullu"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox" id="isActive"
                                    checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="rounded border-gray-300 text-ashoka focus:ring-ashoka w-4 h-4"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Circuit is currently active</label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-md font-black uppercase text-xs tracking-wider transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-ashoka hover:bg-blue-900 text-white py-3 rounded-md font-black uppercase text-xs tracking-wider transition-colors">
                                    {editingCircuit ? 'Deploy Updates' : 'Publish Jurisdiction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CircuitsModule;
