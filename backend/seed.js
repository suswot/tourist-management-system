const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tourist = require('./models/Tourist');
const Hotel = require('./models/Hotel');
const Circuit = require('./models/Circuit');
const City = require('./models/City');
const CitizenReport = require('./models/CitizenReport');

dotenv.config();

const indianNames = [
    'Rajat Verma', 'Priya Patel', 'Amit Kumar', 'Neha Gupta', 'Vikram Singh', 'Anita Desai', 'Rahul Sharma', 'Sneha Iyer', 'Karan Malhotra', 'Pooja Reddy', 'Siddharth Bose', 'Kavita Joshi',
    'Arjun Nair', 'Meera Rao', 'Sanjay Dutt', 'Lakshmi Menon', 'Kishore Kumar', 'Ritu Nanda', 'Rakesh Roshan', 'Simran Kaur', 'Aditya Roy', 'Nandini Das', 'Varun Dhawan', 'Shruti Haasan'
];

const cityData = [
    { name: 'Delhi', zone: 'North' },
    { name: 'Jaipur', zone: 'North' },
    { name: 'Udaipur', zone: 'North' },
    { name: 'Shimla', zone: 'North' },
    { name: 'Manali', zone: 'North' },
    { name: 'Mumbai', zone: 'West/Central' },
    { name: 'Goa', zone: 'West/Central' },
    { name: 'Bhopal', zone: 'West/Central' },
    { name: 'Chennai', zone: 'South' },
    { name: 'Kochi', zone: 'South' },
    { name: 'Munnar', zone: 'South' },
    { name: 'Mysore', zone: 'South' },
    { name: 'Kolkata', zone: 'East' },
    { name: 'Puri', zone: 'East' },
    { name: 'Bodh Gaya', zone: 'East' },
    { name: 'Darjeeling', zone: 'East' },
    { name: 'Guwahati', zone: 'North-East' },
    { name: 'Gangtok', zone: 'North-East' },
    { name: 'Dispur', zone: 'North-East' }
];

const hotelsList = ['Taj View', 'Oberoi Retreat', 'Heritage Inn', 'Sea View Hotel', 'Himalayan Resort', 'Royal Palace', 'Lake View Resort', 'Grand Chola', 'Leela Palace', 'ITC Maurya'];
const bookingSitesList = ['MakeMyTrip', 'Yatra', 'Cleartrip', 'Agoda', 'Booking.com'];

const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomStatus = () => randomElement(['Pending', 'Verified']);
const randomPoliceStatus = () => randomElement(['Pending', 'Verified']);

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tourist_management');
        console.log('MongoDB Connected for Seed');

        await Tourist.deleteMany();
        await Hotel.deleteMany();
        await Circuit.deleteMany();
        await City.deleteMany();
        await CitizenReport.deleteMany();

        // Seed Cities
        const dbCities = [];
        for (const city of cityData) {
            const dbCity = await City.create({ name: city.name, zone: city.zone });
            dbCities.push(dbCity);
        }

        const c1 = await Circuit.create({ name: 'Northern zone', description: 'Delhi, Rajasthan, and HP.', locations: ['Delhi', 'Jaipur', 'Udaipur', 'Shimla', 'Manali'] });
        const c2 = await Circuit.create({ name: 'Western/Central zone', description: 'Mumbai, Goa, and MP.', locations: ['Mumbai', 'Goa', 'Bhopal'] });
        const c3 = await Circuit.create({ name: 'Southern zone', description: 'Chennai, Kerala, Karnataka.', locations: ['Chennai', 'Kochi', 'Munnar', 'Mysore'] });
        const c4 = await Circuit.create({ name: 'Eastern zone', description: 'Kolkata, Odisha, Bihar.', locations: ['Kolkata', 'Puri', 'Bodh Gaya', 'Darjeeling'] });
        const c5 = await Circuit.create({ name: 'North-East zone', description: 'Guwahati, Sikkim, Assam.', locations: ['Guwahati', 'Gangtok', 'Dispur'] });
        const circuits = [c1, c2, c3, c4, c5];

        const generateProfile = async (i, type) => {
            const baseDate = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
            let is_VIP = false;
            let sosActive = false;
            let riskScore = Math.floor(Math.random() * 49); // Default < 50
            let checkOutOffsetHours = -24; // Checked out recently or in future
            let anomalyLocation = false;

            if (type === 'VIP') {
                is_VIP = true;
                riskScore = 95; // Level 1
            } else if (type === 'SOS_OVERSTAY') {
                if (Math.random() > 0.5) {
                    sosActive = true;
                    riskScore = 98; // Level 1
                } else {
                    checkOutOffsetHours = 5; // > 4 hours overstay
                    riskScore = 80; // Level 2
                }
            } else if (type === 'STANDARD') { // Maybe anomaly
                if (Math.random() > 0.8) {
                    riskScore = 60; // Level 3 Anomaly
                    anomalyLocation = true;
                }
            } else if (type === 'HOTSPOT') {
                riskScore = 40; // Base score, Controller will push it up
            }

            const circuit = randomElement(circuits);

            // Assign a factual city and derive its zone
            let cityObj = undefined;

            if (anomalyLocation) {
                cityObj = cityData.find(c => c.name === 'Shimla');
            } else if (type === 'HOTSPOT') {
                cityObj = cityData.find(c => c.name === 'Manali');
            } else {
                // Find a city from the selected jurisdiction
                const locName = randomElement(circuit.locations);
                cityObj = cityData.find(c => c.name === locName) || cityData[0];
            }

            const tourist = await Tourist.create({
                name: indianNames[i % indianNames.length] + ` (T-${i})`,
                email: `tourist${i}@example.com`,
                phone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
                aadhaarNumber: `9${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
                verificationStatus: randomStatus(),
                policeStatus: sosActive ? 'Security Risk' : randomPoliceStatus(),
                sosActive: sosActive,
                circuitId: circuit._id, // This is now Jurisdiction ID structurally
                itineraryDate: baseDate,
                zone: cityObj.zone,
                is_VIP: is_VIP,
                riskScore: riskScore
            });

            // Hotel Check-out mechanics for Overstay
            const checkInDate = new Date();
            checkInDate.setHours(checkInDate.getHours() - 48); // 2 days ago
            const checkOutDate = new Date();
            checkOutDate.setHours(checkOutDate.getHours() - checkOutOffsetHours);

            await Hotel.create({
                bookingId: `BKG-2026-${i}`,
                hotelName: randomElement(hotelsList),
                bookingSite: randomElement(bookingSitesList),
                location: cityObj.name,
                touristId: tourist._id,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                Guide_ID: `GD-${Math.floor(1000 + Math.random() * 9000)}`,
                guideVerified: Math.random() > 0.2,
                auditFlags: { dateMismatch: false, resolved: false }
            });
        };

        console.log('Generating 5 VIPs...');
        for (let i = 0; i < 5; i++) await generateProfile(i, 'VIP');

        console.log('Generating 10 SOS/Overstays...');
        for (let i = 5; i < 15; i++) await generateProfile(i, 'SOS_OVERSTAY');

        console.log('Generating 15 Manali Hotspots...');
        for (let i = 15; i < 30; i++) await generateProfile(i, 'HOTSPOT');

        console.log('Generating 20 Standards...');
        for (let i = 30; i < 50; i++) await generateProfile(i, 'STANDARD');

        console.log('Generating Citizen Reports...');
        const activeCities = ['Manali', 'Shimla', 'Delhi', 'Goa'];
        for (let i = 0; i < 12; i++) {
            const cityName = randomElement(activeCities);
            const refCity = cityData.find(c => c.name === cityName);
            await CitizenReport.create({
                cityName,
                zone: refCity.zone,
                reportType: randomElement(['Noise', 'Parking', 'Trash']),
                description: `Community concern logged systematically regarding resources at ${cityName}.`,
                status: 'Pending'
            });
        }

        console.log('Seed data with 50 specific entries inserted successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
