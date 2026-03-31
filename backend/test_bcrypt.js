const bcrypt = require('bcryptjs');
const signToken = (user) => {
    return 'fake-token';
};

const testLogin = async () => {
    const password = 'zonepass';
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password:', password);
    console.log('Hash:', passwordHash);
    
    const isMatch = await bcrypt.compare(password, passwordHash);
    console.log('Is match with correct password?', isMatch);
    
    const isMatchWrong = await bcrypt.compare('wrong', passwordHash);
    console.log('Is match with wrong password?', isMatchWrong);
};

testLogin();
