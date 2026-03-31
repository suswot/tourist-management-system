const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'national_audit_mock_data.json');
const rawData = fs.readFileSync(dataFile, 'utf8');
const data = JSON.parse(rawData);

const FULL_MAPPING = {
  'North': [
    { city: 'Delhi', coords: [77.2090, 28.6139] },
    { city: 'Jaipur', coords: [75.7873, 26.9124] },
    { city: 'Udaipur', coords: [73.7125, 24.5854] },
    { city: 'Shimla', coords: [77.1734, 31.1048] },
    { city: 'Manali', coords: [77.1892, 32.2432] },
    { city: 'Leh', coords: [77.5771, 34.1526] },
    { city: 'Srinagar', coords: [74.7973, 34.0837] },
    { city: 'Varanasi', coords: [82.9739, 25.3176] },
    { city: 'Agra', coords: [78.0081, 27.1767] },
    { city: 'Rishikesh', coords: [78.3266, 30.0869] },
    { city: 'Haridwar', coords: [78.1642, 29.9457] },
    { city: 'Amritsar', coords: [74.8723, 31.6340] }
  ],
  'West/Central': [
    { city: 'Mumbai', coords: [72.8777, 19.0760] },
    { city: 'Goa', coords: [74.1240, 15.2993] },
    { city: 'Jaisalmer', coords: [70.9160, 26.9157] },
    { city: 'Ajanta', coords: [75.7031, 20.5519] },
    { city: 'Gir', coords: [70.5229, 21.1441] },
    { city: 'Pune', coords: [73.8567, 18.5204] },
    { city: 'Ahmedabad', coords: [72.5714, 23.0225] },
    { city: 'Rann of Kutch', coords: [69.8597, 23.7337] },
    { city: 'Bhopal', coords: [77.4126, 23.2599] },
    { city: 'Indore', coords: [75.8577, 22.7196] },
    { city: 'Khajuraho', coords: [79.9199, 24.8318] },
    { city: 'Ujjain', coords: [75.7849, 23.1765] },
    { city: 'Gwalior', coords: [78.1828, 26.2183] }
  ],
  'South': [
    { city: 'Chennai', coords: [80.2707, 13.0827] },
    { city: 'Kochi', coords: [76.2673, 9.9312] },
    { city: 'Munnar', coords: [77.0595, 10.0889] },
    { city: 'Mysore', coords: [76.6394, 12.2958] },
    { city: 'Hampi', coords: [76.4600, 15.3350] },
    { city: 'Rameshwaram', coords: [79.3129, 9.2876] },
    { city: 'Bengaluru', coords: [77.5946, 12.9716] },
    { city: 'Hyderabad', coords: [78.4867, 17.3850] },
    { city: 'Ooty', coords: [76.6932, 11.4118] },
    { city: 'Madurai', coords: [78.1198, 9.9252] },
    { city: 'Kanyakumari', coords: [77.5385, 8.0883] },
    { city: 'Port Blair', coords: [92.7265, 11.6234] },
    { city: 'Havelock', coords: [92.9786, 11.9761] },
    { city: 'Kavaratti', coords: [72.6369, 10.5667] }
  ],
  'East': [
    { city: 'Kolkata', coords: [88.3639, 22.5726] },
    { city: 'Puri', coords: [85.8312, 19.8135] },
    { city: 'Bodh Gaya', coords: [84.9841, 24.6961] },
    { city: 'Darjeeling', coords: [88.2663, 27.0410] },
    { city: 'Konark', coords: [86.0945, 19.8876] },
    { city: 'Bhubaneswar', coords: [85.8245, 20.2961] },
    { city: 'Patna', coords: [85.1376, 25.5941] }
  ],
  'North-East': [
    { city: 'Guwahati', coords: [91.7362, 26.1445] },
    { city: 'Gangtok', coords: [88.6138, 27.3314] },
    { city: 'Dispur', coords: [91.7898, 26.1433] },
    { city: 'Tawang', coords: [91.8594, 27.5851] },
    { city: 'Shillong', coords: [91.8933, 25.5788] },
    { city: 'Kohima', coords: [94.1086, 25.6701] },
    { city: 'Agartala', coords: [91.2868, 23.8315] },
    { city: 'Imphal', coords: [93.9368, 24.8170] },
    { city: 'Aizawl', coords: [92.7176, 23.7271] }
  ]
};

const regionsList = Object.keys(FULL_MAPPING);

// Map coords for React component copy-pasting
const allCoords = {};
Object.values(FULL_MAPPING).forEach(citiesArr => {
    citiesArr.forEach(c => {
        allCoords[c.city] = c.coords;
    });
});
fs.writeFileSync('new_coords.txt', JSON.stringify(allCoords, null, 2));

for (let i = 0; i < data.length; i++) {
  const randomRegion = regionsList[Math.floor(Math.random() * regionsList.length)];
  const citiesInRegion = FULL_MAPPING[randomRegion];
  const randomCityObj = citiesInRegion[Math.floor(Math.random() * citiesInRegion.length)];

  data[i].region = randomRegion;
  data[i].city = randomCityObj.city;
  
  if (data[i].logistics) {
    data[i].logistics.hotelName = `${randomCityObj.city} Palace Hotel`;
  }
}

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log('Expanded mock data completed.');
