const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['Police_Forward', 'Logistics_Dispute'],
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,

    },
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    senderRole: { type: String, required: true },
    receiverRole: { type: String, required: true },
    notes: [{
        text: String,
        addedBy: String,
        addedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
