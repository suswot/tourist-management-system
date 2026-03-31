const express = require('express');
const router = express.Router();
const { createTicket, getTickets, updateTicket } = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.use(authMiddleware);
router.use(rbacMiddleware);

router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id', updateTicket);

module.exports = router;
