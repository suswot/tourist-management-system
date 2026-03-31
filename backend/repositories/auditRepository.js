const Tourist = require('../models/Tourist');
const Hotel = require('../models/Hotel');
const Circuit = require('../models/Circuit');
const CitizenReport = require('../models/CitizenReport');
const City = require('../models/City');
const ManagerAction = require('../models/ManagerAction');

/**
 * AuditRepository - High-level abstraction for Database interactions
 */
class AuditRepository {
    async findHotelsWithTourists(query = {}) {
        return await Hotel.find().populate({
            path: 'touristId',
            match: query,
            populate: { path: 'circuitId' }
        });
    }

    async findTouristById(id) {
        return await Tourist.findById(id);
    }

    async findTourists(query = {}) {
        return await Tourist.find(query).populate('circuitId');
    }

    async updateTourist(id, updateData) {
        return await Tourist.findByIdAndUpdate(id, updateData, { new: true });
    }

    async findCircuits() {
        return await Circuit.find();
    }

    async findCircuitById(id) {
        return await Circuit.findById(id);
    }

    async createCircuit(data) {
        return await Circuit.create(data);
    }

    async updateCircuit(id, data) {
        return await Circuit.findByIdAndUpdate(id, data, { new: true });
    }

    async findHotelById(id) {
        return await Hotel.findById(id);
    }

    async updateHotel(id, updateData) {
        return await Hotel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async logAction(actionData) {
        return await ManagerAction.create(actionData);
    }

    async findCitizenReports(query = {}) {
        return await CitizenReport.find(query).sort({ createdAt: -1 });
    }

    async findCitizenReportById(id) {
        return await CitizenReport.findById(id);
    }

    async findCities(query = {}) {
        return await City.find(query);
    }

    async updateCityStress(name, status) {
        return await City.findOneAndUpdate({ name }, { utility_stress: status }, { new: true });
    }
}

module.exports = new AuditRepository();
