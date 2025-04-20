import mongoose from 'mongoose';
import config from './conf.js';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
  try {
    // console.log("Attempting to connect with URI:", config.mongodbUri)
    const conn = await mongoose.connect(config.mongodbUri, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000, 
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
}; 

export default connectDB;