const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'NIGERIA ETA-ERP API',
            version: '1.0.0',
            description: 'RESTful API documentation for the Nigeria ETA-ERP application',
            termsOfService: 'https://3sdsolutions.com/terms-and-conditions',
            contact: {
                name: 'Tarini Prasad Roy',
                email: 'tarini.roy@3sdsolutions.com',
            },
            license: {
                name: '3SD Solutions',
                url: 'https://3sdsolutions.com/', // Replace with the actual license URL
            },
        },
        externalDocs: {
            description: 'Find out more about 3SD Solutions',
            url: 'https://3sdsolutions.com',
        },
        servers: [
            {
                url: 'http://192.168.29.60:4000',
                description: 'Development Server',
            },
            {
                url: 'http://192.168.29.7:4000',
                description: 'Testing Server',
            },
            {
                url: 'https://godrejeta.com:4000',
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: "apiKey",
                    name: "Authorization",
                    in: "header",
                },
            },
        },
        security: [
            {
                ApiKeyAuth: [],
            },
        ],
    },
    apis: ['./api.js'], // Path to the files containing the JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
