const auditService = require('../services/auditService');
const auditRepository = require('../repositories/auditRepository');

const getTouristsWithMismatch = async (req, res) => {
    try {
        const results = await auditService.getLogisticsMismatches(req.rbacQuery || {});
        res.json(results);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const verifyTouristIdentity = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const role = req.user?.role || 'Unknown';
        const zone = req.user?.zone || 'Unknown';
        
        const updated = await auditService.verifyIdentity(id, status, role, zone);
        res.json(updated);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllCircuits = async (req, res) => {
    try {
        const circuits = await auditRepository.findCircuits();
        res.json(circuits);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createCircuit = async (req, res) => {
    try {
        const { name, description, locations } = req.body;
        const parsedLocations = Array.isArray(locations)
            ? locations
            : (locations || '').split(',').map(s => s.trim()).filter(Boolean);
        const newCircuit = await auditRepository.createCircuit({ 
            name, description, 
            locations: parsedLocations
        });
        res.status(201).json(newCircuit);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateCircuit = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, locations, isActive } = req.body;
        const circuit = await auditRepository.findCircuitById(id);
        if (!circuit) return res.status(404).json({ message: 'Circuit data node not found' });
        
        if (name) circuit.name = name;
        if (description) circuit.description = description;
        if (locations !== undefined) circuit.locations = typeof locations === 'string' ? locations.split(',').map(s => s.trim()) : locations;
        if (isActive !== undefined) circuit.isActive = isActive;

        const updated = await circuit.save();
        res.json(updated);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllTourists = async (req, res) => {
    try {
        const tourists = await auditRepository.findTourists(req.rbacQuery || {});
        res.json(tourists);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updatePoliceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const tourist = await auditRepository.findTouristById(id);
        if (!tourist) return res.status(404).json({ message: 'Tourist data node not found' });

        tourist.policeStatus = status;
        const updated = await tourist.save();

        const role = req.user?.role || 'Unknown';
        const zone = req.user?.zone || 'Unknown';
        await auditRepository.logAction({
            managerId: `${role}_${zone}`,
            actionType: 'Flag',
            targetId: tourist._id,
            targetModel: 'Tourist',
            details: `Updated police CCTNS status to ${status}`
        });

        res.json(updated);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const resolveHotelMismatch = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await auditRepository.findHotelById(id);
        if (!hotel) return res.status(404).json({ message: 'Logistics data node not found' });

        hotel.auditFlags.resolved = true;
        await hotel.save();
        res.json(hotel);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const generateReport = async (req, res) => {
    try {
        const { reportType } = req.params;
        const report = await auditService.generateComplianceReport(reportType, req.rbacQuery || {});
        
        if (reportType === 'verification-stats') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${report.filename}`);
            await report.workbook.xlsx.write(res);
            return res.end();
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${report.filename}`);
        res.send(report.pdfBuffer);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getGraphicalReport = async (req, res) => {
    try {
        const results = await auditService.getStrategicHeatmap(req.rbacQuery || {});
        res.json(results);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const logManagerAction = async (req, res) => {
    try {
        const { targetId, actionType, targetModel, details } = req.body;
        const role = req.user?.role || 'Unknown';
        const zone = req.user?.zone || 'Unknown';
        const action = await auditRepository.logAction({ managerId: `${role}_${zone}`, actionType, targetId, targetModel, details });
        res.status(201).json(action);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getCitizenReports = async (req, res) => {
    try {
        const zone = req.user?.zone || 'North';
        const matchQuery = req.rbacQuery || {};
        const query = { ...matchQuery };
        if (zone && zone !== 'All') query.zone = zone;
        const reports = await auditRepository.findCitizenReports(query);
        res.json(reports);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const resolveCitizenReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await auditRepository.findCitizenReportById(id);
        if (!report) return res.status(404).json({ message: 'Report node not found' });
        report.status = 'Resolved';
        await report.save();
        res.json(report);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getCities = async (req, res) => {
    try {
        const cities = await auditRepository.findCities(req.user?.zone && req.user.zone !== 'All' ? { zone: req.user.zone } : {});
        res.json(cities);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

/**
 * Newly added Controller method based on User Request
 */
const getTouristAuditTrail = async (req, res) => {
    try {
        const { id } = req.params;
        const logs = await auditService.getTouristAuditTrail(id);
        res.json(logs);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
    getTouristsWithMismatch, verifyTouristIdentity, getAllCircuits, getAllTourists,
    updatePoliceStatus, resolveHotelMismatch, generateReport, getGraphicalReport,
    createCircuit, updateCircuit, logManagerAction, getCitizenReports,
    resolveCitizenReport, getCities, getTouristAuditTrail
};
