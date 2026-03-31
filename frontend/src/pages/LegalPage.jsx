import React from 'react';
import { ShieldAlert, FileText, HelpCircle, ArrowLeft, Building2, ShieldCheck, Mail, Phone, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const LegalPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const type = location.hash.replace('#', '') || 'privacy';

    const renderContent = () => {
        switch (type) {
            case 'tos':
                return (
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-black text-ashoka uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-saffron" /> 1. National Command Terms
                            </h3>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                                Current usage of the TMS (Tourist Management System) is strictly for authorized personnel of the Ministry of Tourism, Govt. of India. Unauthorized data scraping or API manipulation will result in immediate termination of CID (Command ID) and legal escalation through the IT Act 2000.
                            </p>
                        </section>
                        <section>
                            <h3 className="text-sm font-black text-ashoka uppercase tracking-widest mb-3">2. Data Sovereignty</h3>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                                All tourist telemetry, including Aadhaar/Passport data, remains property of the National Security Infrastructure. External vendors (Booking Sites/Hotels) are obligated to report real-time occupancy within 24 hours of check-in under the Tourism (Mandatory Reporting) Directive 2026.
                            </p>
                        </section>
                    </div>
                );
            case 'support':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bento-card bg-slate-50 border-ashoka/10">
                            <h3 className="text-xs font-black text-ashoka uppercase tracking-[0.2em] mb-4">Strategic Hotline</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-ashoka/5 text-ashoka rounded-lg"><Phone className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Tier 1 Support</p>
                                        <p className="text-sm font-black text-ashoka">+91 011-2301-TMS-NODE</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-saffron/10 text-saffron rounded-lg"><Mail className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">System Admin</p>
                                        <p className="text-sm font-black text-ashoka">ops-support@tms.gov.in</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bento-card border-slate-200">
                             <h3 className="text-xs font-black text-ashoka uppercase tracking-[0.2em] mb-4">Command Messaging</h3>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-4">Dispatch a priority signal to the Regional Liaison if experiencing authentication lag or database synchronization issues.</p>
                             <button className="w-full btn-ashoka text-[10px] uppercase tracking-widest">Open Secure Ticket</button>
                        </div>
                    </div>
                );
            case 'privacy':
            default:
                return (
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-black text-ashoka uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-saffron" /> 1. PII Protection (Aadhaar/Passport)
                            </h3>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                                All Personally Identifiable Information is encrypted at rest using AES-256 standards within the National Cloud Framework. Access logs for KYC verification are audited hourly. Only users with "National_Admin" or "Police" clearance may view unmasked Passport strings.
                            </p>
                        </section>
                        <section>
                             <h3 className="text-sm font-black text-ashoka uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-red-500" /> 2. Law Enforcement Disclosure
                            </h3>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                                Historical route telemetry and SOS triggers are shared with local state police jurisdictions automatically during "Security Risk" escalations. This data is deleted 30 days after the tourist exits the national circuit.
                            </p>
                        </section>
                    </div>
                );
        }
    };

    const titleMap = { 'privacy': 'Security & Privacy Protocol', 'tos': 'National usage Directives', 'support': 'Operational Support Node' };

    return (
        <div className="min-h-screen bg-slate-50 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-ashoka text-white py-12 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-ashoka to-blue-900 z-0"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-white/60 hover:text-white mb-8 text-[11px] font-black uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return to Command Dashboard
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Building2 className="w-8 h-8 text-saffron" />
                                <h1 className="text-3xl font-black uppercase tracking-tighter">TMS {titleMap[type] || 'Legal Node'}</h1>
                            </div>
                            <p className="text-blue-300 text-xs font-bold uppercase tracking-[0.2em] max-w-xl">
                                Strategic documentation governing the operational integrity of the national tourist safety infrastructure. Version 2026.0.4 - Alpha-5.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Navigation Sidebar */}
                <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Command Sections</h4>
                    {['privacy', 'tos', 'support'].map((linkType) => (
                        <button
                            key={linkType}
                            onClick={() => navigate(`/legal#${linkType}`)}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${type === linkType ? 'bg-ashoka text-white shadow-lg shadow-ashoka/20' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                        >
                            <span className="text-xs font-black uppercase tracking-widest">
                                {linkType === 'tos' ? 'Terms' : linkType === 'privacy' ? 'Privacy' : 'Support'}
                            </span>
                            <ArrowLeft className={`w-4 h-4 transform rotate-180 transition-transform ${type === linkType ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3 bento-card min-h-[400px]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
