const express = require('express');
const router = express.Router();
const rbacMiddleware = require('../middleware/rbacMiddleware');

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
    getCities
} = require('../controllers/auditController');

// Logistics Audit Route
router.get('/logistics-mismatch', rbacMiddleware, getTouristsWithMismatch);
router.patch('/hotel/:id/resolve', rbacMiddleware, resolveHotelMismatch);

// Identity Hub Routes
router.patch('/tourist/:id/verify', rbacMiddleware, verifyTouristIdentity);
router.patch('/tourist/:id/police-status', rbacMiddleware, updatePoliceStatus);
router.get('/tourists', rbacMiddleware, getAllTourists);

// Reports
router.get('/reports/graphical', rbacMiddleware, getGraphicalReport);
router.get('/reports/:reportType', rbacMiddleware, generateReport);

// Circuits listing
router.get('/circuits', rbacMiddleware, getAllCircuits);
router.post('/circuit', rbacMiddleware, createCircuit);
router.patch('/circuit/:id', rbacMiddleware, updateCircuit);

// Action Logging
router.post('/actions/log', rbacMiddleware, logManagerAction);

// Community Feedback
router.get('/citizen-reports', rbacMiddleware, getCitizenReports);
router.patch('/citizen-reports/:id/resolve', rbacMiddleware, resolveCitizenReport);

// Cities Health Status
router.get('/cities', rbacMiddleware, getCities);

module.exports = router;
