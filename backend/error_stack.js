try {
    require('./controllers/auditController');
} catch (e) {
    console.log('--- ERROR ---');
    console.log(e.message);
    console.log(e.stack);
}
