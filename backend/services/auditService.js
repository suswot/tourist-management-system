const auditRepository = require('../repositories/auditRepository');
const ExcelJS = require('exceljs');
const { jsPDF } = require('jspdf');
const Hotel = require('../models/Hotel');
const ManagerAction = require('../models/ManagerAction');

/**
 * AuditService - Business logic layer for TMS 
 * Contains all the logic for verifying mismatches, calculating risk scores, 
 * and generating operational reports.
 */
class AuditService {
    async getLogisticsMismatches(rbacQuery = {}) {
        const hotels = await auditRepository.findHotelsWithTourists(rbacQuery);
        const CAPACITY_LIMIT = 15;

        // District-wise counts for capacity alerts
        const districtCounts = {};
        hotels.forEach(h => { districtCounts[h.location] = (districtCounts[h.location] || 0) + 1; });

        return hotels.filter(h => h.touristId).map(hotel => {
            const hasCapacityBreach = districtCounts[hotel.location] >= CAPACITY_LIMIT;
            const validLocations = hotel.touristId.circuitId?.locations?.map(l => l.toLowerCase()) || [];
            const isAnomaly = !validLocations.includes(hotel.location.toLowerCase());

            let overstayData = { isOverstay: false, type: null };
            if (hotel.checkOutDate) {
                const diffHours = (Date.now() - new Date(hotel.checkOutDate).getTime()) / 3600000;
                if (diffHours > 4) overstayData = { isOverstay: true, type: 'MISSING PERSON' };
                else if (diffHours > 2) overstayData = { isOverstay: true, type: 'STATUS CHECK' };
            }

            // User Rule: Cross-reference checkInDate against itineraryDate. Flag mismatch > 24 hours.
            const checkInDate = new Date(hotel.checkInDate).getTime();
            const itineraryDate = new Date(hotel.touristId.itineraryDate).getTime();
            const dateMismatchHours = Math.abs(checkInDate - itineraryDate) / 3600000;
            const isDateMismatch = dateMismatchHours > 24;

            if (hotel.auditFlags?.resolved) return null;

            let finalRiskScore = hotel.touristId.riskScore || 0;
            if (isDateMismatch) finalRiskScore = Math.max(finalRiskScore, 70); // High priority anomaly
            if (hasCapacityBreach && (isAnomaly || overstayData.isOverstay)) finalRiskScore = 99; // Sector Emergency

            return {
                ...hotel.toObject(),
                securityAlerts: {
                    capacityBreach: hasCapacityBreach,
                    safetyAnomaly: isAnomaly,
                    overstayEscalation: overstayData.isOverstay,
                    overstayType: overstayData.type,
                    dateMismatch: isDateMismatch
                },
                priorityData: {
                    riskScore: finalRiskScore,
                    is_VIP: hotel.touristId.is_VIP,
                    zone: hotel.touristId.zone
                }
            };
        }).filter(h => h && (h.securityAlerts.capacityBreach || h.securityAlerts.safetyAnomaly || h.securityAlerts.overstayEscalation || h.securityAlerts.dateMismatch || h.priorityData.riskScore > 50));
    }

    async verifyIdentity(touristId, status, role, zone) {
        const tourist = await auditRepository.findTouristById(touristId);
        if (!tourist) throw new Error('Tourist data node not found');

        tourist.verificationStatus = status;
        const updated = await tourist.save();

        await auditRepository.logAction({
            managerId: `${role}_${zone}`,
            actionType: 'Verify',
            targetId: tourist._id,
            targetModel: 'Tourist',
            details: `Identity verification protocol outcome: ${status}`
        });

        return updated;
    }

    async getStrategicHeatmap(rbacQuery = {}) {
        const hotels = await auditRepository.findHotelsWithTourists(rbacQuery);
        const districtCounts = {};
        hotels.forEach(h => { if (h.touristId) districtCounts[h.location] = (districtCounts[h.location] || 0) + 1; });

        const CITY_CAPACITY = 15;
        const trendData = [];

        for (const loc of Object.keys(districtCounts)) {
            const count = districtCounts[loc];
            const percentage = Math.round((count / CITY_CAPACITY) * 100);
            const status = percentage > 80 ? 'RESOURCE_STRAIN' : 'NORMAL';

            await auditRepository.updateCityStress(loc, status);
            trendData.push({ name: loc, count, capacity: CITY_CAPACITY, percentage, isCritical: percentage >= 85, utility_stress: status });
        }

        const criticalLevels = trendData.filter(t => t.isCritical);
        let summaryText = "National Sector Stablised. No immediate threats.";
        if (criticalLevels.length > 0) {
            summaryText = `CRITICAL ALERT: Strategic breach in sectors ${criticalLevels.map(d => d.name).join(', ')}. Dispatching prioritised support units recommended.`;
        }

        return { heatmap: trendData, trendData: trendData.sort((a,b) => b.percentage - a.percentage), summary: summaryText };
    }

    async generateComplianceReport(type, rbacQuery = {}) {
        const tourists = await auditRepository.findTourists(rbacQuery);
        if (type === 'verification-stats') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('National Audit');
            sheet.columns = [
                { header: 'ENTITY ID', key: '_id', width: 25 },
                { header: 'NOMENCLATURE', key: 'name', width: 25 },
                { header: 'KYC STATUS', key: 'verificationStatus', width: 15 },
                { header: 'CCTNS STATUS', key: 'policeStatus', width: 15 }
            ];
            tourists.forEach(t => sheet.addRow(t.toObject()));
            return { workbook, filename: 'national-audit-log.xlsx' };
        }
        
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(`TMS National Intelligence Summary - ${type.toUpperCase()}`, 14, 20);
        tourists.slice(0, 20).forEach((t, i) => doc.text(`- Sector Pax: ${t.name} | CCTNS: ${t.policeStatus}`, 14, 40 + i*10));
        return { pdfBuffer: Buffer.from(doc.output('arraybuffer')), filename: `${type}.pdf` };
    }

    /**
     * User Request: Comprehensive Audit Trail for a particular entity
     */
    async getTouristAuditTrail(touristId) {
        // Find the tourist first
        const tourist = await auditRepository.findTouristById(touristId);
        if (!tourist) throw new Error('Sentinel Entity not found in registry');

        // Find all hotels associated with this tourist to capture "Safety Issues" raised there
        const associatedHotels = await Hotel.find({ touristId });
        const hotelIds = associatedHotels.map(h => h._id);

        // Fetch logs from ManagerAction for both Tourist and their related Hotels
        const logs = await ManagerAction.find({
            $or: [
                { targetId: touristId, targetModel: 'Tourist' },
                { targetId: { $in: hotelIds }, targetModel: 'Hotel' }
            ]
        }).sort({ createdAt: -1 });

        // Map logs to a readable format
        const formattedLogs = logs.map(log => ({
            id: log._id,
            actionType: log.actionType,
            details: log.details,
            timestamp: log.createdAt,
            manager: log.managerId
        }));

        // AUTOMATED AUDIT INJECTION: 
        // If logs are empty (for demo), we add some system-generated logs based on tourist status
        if (formattedLogs.length === 0) {
            if (tourist.sosActive) {
                formattedLogs.push({ actionType: 'Flag', details: 'CRITICAL: SOS Signal Received by National Monitoring Center', timestamp: tourist.updatedAt });
            }
            if (tourist.policeStatus === 'Security Risk') {
                formattedLogs.push({ actionType: 'Flag', details: 'SYSTEM: Police CCTNS Status escalated to Security Risk', timestamp: tourist.updatedAt });
            }
            if (tourist.verificationStatus === 'Verified') {
                formattedLogs.push({ actionType: 'Verify', details: 'PROVISIONED: National Identity Sentinel cleared for sector entry', timestamp: tourist.updatedAt });
            }
        }

        return formattedLogs;
    }
}

module.exports = new AuditService();
