import dotenv from 'dotenv';
dotenv.config({ path: './.env' });  

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    mongodbUri: process.env.MONGO_URI || "mongodb://localhost:27017",
    BASE_URL: process.env.BASE_URL || `localhost${process.env.PORT}` ,
};


// Freeze the object to prevent accidental modifications elsewhere
Object.freeze(config);

export default config;