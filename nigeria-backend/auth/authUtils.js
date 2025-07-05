const bcrypt = require('bcrypt');
const crypto = require('crypto');

const configVars = {
    usePasswordHash: false,
    passwordHashOptions: {
        saltRounds: 10, // Adjust the number of salt rounds as needed
        // Other bcrypt options can be added here
    },
    hash: 'sha256', // Set your desired hash algorithm (e.g., 'sha256')
};

function hashPassword(pass, userId) {
    if (configVars.usePasswordHash) {
        const saltRounds = configVars.passwordHashOptions.saltRounds || 10; // Set your desired salt rounds
        return bcrypt.hash(pass, saltRounds);
    } else {
        const salt = crypto.createHash('md5').update(userId).digest('hex'); // Calculate MD5 hash
        const hashAlgorithm = configVars.hash || 'sha256'; // Set your desired hash algorithm
        return crypto.createHash(hashAlgorithm).update(salt + pass).digest('hex');
    }
}

module.exports = {
    hashPassword,
};
