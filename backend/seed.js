const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Tourist = require('./models/Tourist');
const Hotel = require('./models/Hotel');
const Circuit = require('./models/Circuit');
const City = require('./models/City');
const CitizenReport = require('./models/CitizenReport');
const { User } = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        // Local Seeding Backup: mongodb://localhost:27017/tms
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://suswot69_db_user:4DgtWuBFpvayXZVC@ac-i9lkxfe-shard-00-00.u3oivzc.mongodb.net:27017,ac-i9lkxfe-shard-00-01.u3oivzc.mongodb.net:27017,ac-i9lkxfe-shard-00-02.u3oivzc.mongodb.net:27017/tms?ssl=true&replicaSet=atlas-xmcknr-shard-0&authSource=admin&appName=safarsafe');
        console.log('--- REBOOTING NATIONAL COMMAND DATABASE (400 RECORD INGESTION) ---');

        await Tourist.deleteMany();
        await Hotel.deleteMany();
        await Circuit.deleteMany();
        await City.deleteMany();
        await CitizenReport.deleteMany();
        await User.deleteMany();

        // Seed operational users
        const userSeeds = [
            { name: 'North Zone Manager', email: 'zone@tms.gov.in', role: 'Zone_Manager', zone: 'North', password: 'zonepass' },
            { name: 'VIP Liaison', email: 'vip@tms.gov.in', role: 'VIP_Liaison', zone: 'All', password: 'vippass' },
            { name: 'Regional Admin', email: 'regional@tms.gov.in', role: 'Regional_Admin', zone: 'West/Central', password: 'regionalpass' },
            { name: 'National Admin', email: 'national@tms.gov.in', role: 'National_Admin', zone: 'All', password: 'nationalpass' }
        ];

        const hashedUsers = await Promise.all(userSeeds.map(async (u) => ({
            name: u.name,
            email: u.email.toLowerCase(),
            role: u.role,
            zone: u.zone,
            passwordHash: await bcrypt.hash(u.password, 10)
        })));

        await User.create(hashedUsers);

        // 1. Create Regional Circuits
        const circuitsObj = {};
        const regions = [
            { name: 'North', desc: 'Delhi, Leh, Srinagar, Varanasi' },
            { name: 'South', desc: 'Hampi, Munnar, Rameshwaram, Chennai' },
            { name: 'East', desc: 'Kolkata, Puri, Konark, Darjeeling' },
            { name: 'West', desc: 'Jaisalmer, Ajanta, Gir, Mumbai' },
            { name: 'North-East', desc: 'Tawang, Gangtok, Shillong' }
        ];

        const normalizeZone = (z) => z === 'West' ? 'West/Central' : z;

        for (const r of regions) {
            const normalizedName = normalizeZone(r.name);
            const circuit = await Circuit.create({ 
                name: `${normalizedName} Sector`, 
                description: r.desc, 
                locations: r.desc.split(', ') 
            });
            circuitsObj[normalizedName] = circuit;
        }

        // 2. Read Mock Data JSON
        const rawData = fs.readFileSync(path.join(__dirname, '../national_audit_mock_data.json'), 'utf8');
        const data = JSON.parse(rawData);

        console.log(`Ingesting ${data.length} Tactical Records...`);

        const citiesCreated = new Set();

        for (let i = 0; i < data.length; i++) {
            const record = data[i];
            let { region, city, touristMetadata, logistics, healthMetrics } = record;
            
            region = normalizeZone(region);

            // Handle City
            if (!citiesCreated.has(city)) {
                await City.create({ name: city, zone: region });
                citiesCreated.add(city);
            }

            // Map UID to Aadhaar/Passport
            const isAadhaar = touristMetadata.uid.startsWith('A-');
            const touristData = {
                name: touristMetadata.name,
                email: `intel${i}@command.gov.in`,
                phone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
                aadhaarNumber: isAadhaar ? touristMetadata.uid.replace('A-', '') : undefined,
                passportNumber: !isAadhaar ? touristMetadata.uid.replace('P-', '') : undefined,
                verificationStatus: logistics.isMismatchTarget ? 'Pending' : 'Verified',
                policeStatus: touristMetadata.riskScore > 90 ? 'Security Risk' : (logistics.isMismatchTarget ? 'Flagged' : 'Verified'),
                sosActive: touristMetadata.riskScore > 95,
                zone: region,
                is_VIP: touristMetadata.isVIP,
                riskScore: touristMetadata.riskScore,
                circuitId: circuitsObj[region]._id,
                itineraryDate: new Date(logistics.itineraryDate)
            };

            const tourist = await Tourist.create(touristData);

            // Handle Hotel
            await Hotel.create({
                bookingId: `NT-400-OPS-${i}`,
                hotelName: logistics.hotelName,
                bookingSite: 'Direct Command Node',
                location: city,
                touristId: tourist._id,
                checkInDate: new Date(logistics.checkInDate),
                checkOutDate: new Date(new Date(logistics.checkInDate).getTime() + 86400000), // Default 1 day
                Guide_ID: `GD-NT-${i}`,
                guideVerified: true,
                auditFlags: {
                    dateMismatch: logistics.isMismatchTarget,
                    resolved: false
                }
            });

            // Handle Citizen Report
            if (healthMetrics.citizenComplaint) {
                await CitizenReport.create({
                    cityName: city,
                    zone: region,
                    reportType: 'Other',
                    description: healthMetrics.citizenComplaint,
                    status: 'Pending',
                    reporterName: 'Automated Node'
                });
            }
        }

        console.log('--- NATIONAL DATABASE SYNCHRONIZED (400/400) ---');
        process.exit();
    } catch (error) {
        console.error('CRITICAL SYNC ERROR:', error);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`- Field: ${key}, Message: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

seedData();
