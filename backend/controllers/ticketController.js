const Ticket = require('../models/Ticket');

// Create a new ticket
const createTicket = async (req, res) => {
    try {
        const ticket = await Ticket.create(req.body);
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get tickets based on receiver role (e.g. Police sees Police_Forward, Booking Site sees Logistics_Dispute)
const getTickets = async (req, res) => {
    try {
        const role = req.user?.role;

        let query = {};
        if (role === 'National_Admin' || role === 'Regional_Admin') query.senderRole = 'Tourism_Manager';
        else if (role === 'Zone_Manager') query.receiverRole = 'Police';
        else if (role === 'VIP_Liaison') query.receiverRole = 'Booking_Site';

        const tickets = await Ticket.find(query).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reply to or resolve ticket
const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note, addedBy } = req.body;

        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        if (status) ticket.status = status;
        if (note) {
            ticket.notes.push({ text: note, addedBy: addedBy || 'System' });
        }

        const updated = await ticket.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTicket, getTickets, updateTicket };
