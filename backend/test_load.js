try {
    const audit = require('./controllers/auditController');
    console.log('Audit Controller Loaded');
    const db = require('./config/db');
    console.log('DB Config Loaded');
    const routes = require('./routes/auditRoutes');
    console.log('Audit Routes Loaded');
} catch (e) {
    console.error('FAILED TO LOAD:', e);
}
