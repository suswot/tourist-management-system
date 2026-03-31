const fs = require('fs');
const data = JSON.parse(fs.readFileSync('national_audit_mock_data.json'));
const cities = [...new Set(data.map(d => `${d.city} (${d.region})`))];
fs.writeFileSync('tmp_cities.txt', cities.sort().join('\n'));
console.log('Done');
