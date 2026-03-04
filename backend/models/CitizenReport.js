const mongoose = require('mongoose');

const citizenReportSchema = new mongoose.Schema({
    cityName: { type: String, required: true },
    zone: { type: String, required: true },
    reportType: { type: String, enum: ['Noise', 'Parking', 'Trash', 'Other'], required: true },
    description: { type: String },
    reporterName: { type: String, default: 'Anonymous Citizen' },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

const CitizenReport = mongoose.model('CitizenReport', citizenReportSchema);
module.exports = CitizenReport;
