const jwt = require('jsonwebtoken');

const properties = require(`../properties.json`);
const environment = properties.env.environment || 'development';
//require('dotenv').config();
// Determine the environment (default to 'development' if not set)
//const environment = process.env.NODE_ENV || 'development';
const config = require(`../config.${environment}.json`);
const secretKey = config.auth.secretKey;
//console.log('Secret Key:', secretKey);
// Secret key for JWT (keep this secret in a real application)
//const secretKey = 'your-secret-key';
//const secretKey = process.env.YOUR_SECRET_KEY;

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'You are not authorized to perform this action.' });
    }
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid User. You are not authorized to perform this action.' });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateJWT;
