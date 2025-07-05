const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 4002;

// Sample database with employee data
const employees = [
    { id: 1, name: 'John', role: 'admin' },
    { id: 2, name: 'Jane', role: 'user' },
];

// Secret key for JWT (keep this secret in a real application)
//const secretKey = 'your-secret-key';
require('dotenv').config();
const secretKey = process.env.YOUR_SECRET_KEY;
console.log('Secret Key:', secretKey);

// Middleware for authentication using JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = user;
        next();
    });
};

// Sample login route to generate JWT
app.post('/login', (req, res) => {
    // In a real app, you would validate user credentials here
    // For simplicity, we'll assume authentication is successful
    const user = { id: 1, name: 'John', role: 'admin' };

    const token = jwt.sign(user, secretKey);
    console.log(token);
    res.json({ token });
});

// Protected route that requires authentication and authorization
app.get('/employees', authenticateJWT, (req, res) => {
    // Authorization check: Only 'admin' users are allowed
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    res.json(employees);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
