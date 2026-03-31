const express = require('express');
const router = express.Router();
const rbacMiddleware = require('../middleware/rbacMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const {
    getTouristsWithMismatch,
    verifyTouristIdentity,
    getAllCircuits,
    getAllTourists,
    updatePoliceStatus,
    resolveHotelMismatch,
    generateReport,
    getGraphicalReport,
    createCircuit,
    updateCircuit,
    logManagerAction,
    getCitizenReports,
    resolveCitizenReport,
    getCities,
    getTouristAuditTrail
} = require('../controllers/auditController');

// Require authentication + RBAC for all audit routes
router.use(authMiddleware);
router.use(rbacMiddleware);

// Logistics Audit Route
router.get('/logistics-mismatch', getTouristsWithMismatch);
router.patch('/hotel/:id/resolve', resolveHotelMismatch);

// Identity Hub Routes
router.patch('/tourist/:id/verify', verifyTouristIdentity);
router.patch('/tourist/:id/police-status', updatePoliceStatus);
router.get('/tourists', getAllTourists);
router.get('/tourist/:id/audit-trail', getTouristAuditTrail);

// Reports
router.get('/reports/graphical', getGraphicalReport);
router.get('/reports/:reportType', generateReport);

// Circuits listing
router.get('/circuits', getAllCircuits);
router.post('/circuit', createCircuit);
router.patch('/circuit/:id', updateCircuit);

// Action Logging
router.post('/actions/log', logManagerAction);

// Community Feedback
router.get('/citizen-reports', getCitizenReports);
router.patch('/citizen-reports/:id/resolve', resolveCitizenReport);

// Cities Health Status
router.get('/cities', getCities);

module.exports = router;
