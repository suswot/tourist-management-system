const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const auditRoutes = require('./routes/auditRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Tactical Debug Logger
app.use((req, res, next) => {
    console.log(`[TAC-NODE] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/', (req, res) => {
    res.send('Tourist Management System API');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
