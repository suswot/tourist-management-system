const express = require('express');
const router = express.Router();
const { createTicket, getTickets, updateTicket } = require('../controllers/ticketController');

router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id', updateTicket);

module.exports = router;
